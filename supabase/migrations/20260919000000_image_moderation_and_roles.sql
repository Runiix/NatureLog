-- Roles, image moderation and the quarantine bucket.
--
-- Uploads are checked automatically on the server. Images that pass go live;
-- borderline ones wait in the private `moderation_queue` bucket until an admin
-- approves or rejects them. Only the server (service role) writes moderation
-- state, and only the server may write live images into the `profiles` bucket,
-- otherwise a user could skip the check by uploading from the browser.

begin;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Users may see their own role. There are deliberately no insert, update or
-- delete policies: roles are granted in the SQL editor or with the service
-- role, never by a user.
drop policy if exists "Users read their own role" on public.user_roles;
create policy "Users read their own role"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Moderation records
-- ---------------------------------------------------------------------------

create table if not exists public.image_moderation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('profile_picture', 'profile_grid', 'collection')),
  status text not null check (status in ('approved', 'pending', 'rejected')),
  decided_by text not null check (decided_by in ('auto', 'admin')),
  scores jsonb,
  flagged_categories text[] not null default '{}',
  -- Objects in the moderation_queue bucket while the image is pending.
  queue_paths text[] not null default '{}',
  -- Objects in the profiles bucket once the image is live.
  live_paths text[] not null default '{}',
  -- What approval needs to finish the upload (animal_id, date, old_name, ...).
  payload jsonb not null default '{}',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists image_moderation_status_created_idx
  on public.image_moderation (status, created_at);
create index if not exists image_moderation_user_idx
  on public.image_moderation (user_id);

alter table public.image_moderation enable row level security;

-- Read-only for owners and admins; all writes go through the service role.
drop policy if exists "Owners and admins read moderation records" on public.image_moderation;
create policy "Owners and admins read moderation records"
  on public.image_moderation for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Quarantine bucket (private, no policies: service role only)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('moderation_queue', 'moderation_queue', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Users may no longer write into the profiles bucket directly
-- ---------------------------------------------------------------------------
-- The existing storage policies were created in the dashboard, so their names
-- are unknown here. Every INSERT or UPDATE policy that mentions the profiles
-- bucket is dropped. An ALL policy is replaced by SELECT and DELETE policies
-- with the same condition, so owners keep reading and deleting their files.

do $$
declare
  pol record;
begin
  for pol in
    select policyname, cmd, roles, qual
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'ALL')
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%''profiles''%'
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);

    if pol.cmd = 'ALL' and pol.qual is not null then
      execute format(
        'create policy %I on storage.objects for select to %s using (%s)',
        left(pol.policyname, 50) || ' (select)',
        array_to_string(pol.roles, ', '),
        pol.qual
      );
      execute format(
        'create policy %I on storage.objects for delete to %s using (%s)',
        left(pol.policyname, 50) || ' (delete)',
        array_to_string(pol.roles, ', '),
        pol.qual
      );
    end if;
  end loop;
end
$$;

commit;
