-- Lexicon submissions and admin-managed animals.
--
-- Users propose a new description, a new lexicon image or a missing animal.
-- Proposals wait in `lexicon_submissions` (images in the private
-- `moderation_queue` bucket under lexicon/<uid>/) until an admin approves or
-- rejects them. Approval writes to `animals` and the public `animalImages`
-- bucket. Admins may also create animals directly.
--
-- Every write is done with the caller's own session, never the service role,
-- so the policies below are what decide who may do what.

begin;

-- ---------------------------------------------------------------------------
-- animals: public read, admin-only write
-- ---------------------------------------------------------------------------
-- The existing policies were created in the dashboard, so their names are
-- unknown here. All of them are dropped and replaced by the four below, so no
-- forgotten write policy survives.

alter table public.animals enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'animals'
  loop
    execute format('drop policy %I on public.animals', pol.policyname);
  end loop;
end
$$;

create policy "Anyone reads animals"
  on public.animals for select
  to anon, authenticated
  using (true);

create policy "Admins insert animals"
  on public.animals for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins update animals"
  on public.animals for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete animals"
  on public.animals for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------

create table if not exists public.lexicon_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('description', 'image', 'new_animal')),
  -- Null only for a new animal.
  animal_id bigint references public.animals (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- The proposed values: { description } or the animal's columns. On approval
  -- it is overwritten with what was actually written.
  data jsonb not null default '{}',
  -- [lexicon thumbnail, main image] in the moderation_queue bucket.
  queue_paths text[] not null default '{}',
  scores jsonb,
  flagged_categories text[] not null default '{}',
  -- The animal's values an approval replaced, for audit and rollback.
  previous jsonb,
  review_note text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint lexicon_submissions_animal_matches_kind
    check ((kind = 'new_animal') = (animal_id is null))
);

create index if not exists lexicon_submissions_status_created_idx
  on public.lexicon_submissions (status, created_at);
create index if not exists lexicon_submissions_user_idx
  on public.lexicon_submissions (user_id);

-- One open proposal per user, animal and kind.
create unique index if not exists lexicon_submissions_one_pending_idx
  on public.lexicon_submissions (user_id, animal_id, kind)
  where status = 'pending' and animal_id is not null;

alter table public.lexicon_submissions enable row level security;

-- Number of the caller's open proposals. Security definer so the insert policy
-- can count rows without depending on the select policy.
create or replace function public.lexicon_pending_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.lexicon_submissions
  where user_id = auth.uid() and status = 'pending';
$$;

revoke all on function public.lexicon_pending_count() from public;
grant execute on function public.lexicon_pending_count() to authenticated;

drop policy if exists "Owners and admins read lexicon submissions" on public.lexicon_submissions;
create policy "Owners and admins read lexicon submissions"
  on public.lexicon_submissions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- A user may only file an open, unreviewed proposal of their own, whose images
-- sit in their own queue folder, and at most 10 at a time.
drop policy if exists "Users submit their own proposals" on public.lexicon_submissions;
create policy "Users submit their own proposals"
  on public.lexicon_submissions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and previous is null
    and review_note is null
    and reviewed_by is null
    and reviewed_at is null
    and not exists (
      select 1 from unnest(queue_paths) as path
      where path not like 'lexicon/' || auth.uid()::text || '/%'
    )
    and public.lexicon_pending_count() < 10
  );

-- Only admins decide, and only while a proposal is open.
drop policy if exists "Admins review proposals" on public.lexicon_submissions;
create policy "Admins review proposals"
  on public.lexicon_submissions for update
  to authenticated
  using (public.is_admin() and status = 'pending')
  with check (public.is_admin());

-- Owners may withdraw a proposal nobody has decided yet.
drop policy if exists "Owners withdraw open proposals" on public.lexicon_submissions;
create policy "Owners withdraw open proposals"
  on public.lexicon_submissions for delete
  to authenticated
  using (user_id = auth.uid() and status = 'pending');

-- Who reviewed and when is stamped here rather than trusted from the client,
-- and a review cannot rewrite who filed what.
create or replace function public.lexicon_submissions_stamp_review()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.kind := old.kind;
  new.animal_id := old.animal_id;
  new.created_at := old.created_at;
  if new.status is distinct from old.status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  else
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists lexicon_submissions_stamp_review on public.lexicon_submissions;
create trigger lexicon_submissions_stamp_review
  before update on public.lexicon_submissions
  for each row execute function public.lexicon_submissions_stamp_review();

-- ---------------------------------------------------------------------------
-- Storage: queued proposal images (moderation_queue, lexicon/<uid>/...)
-- ---------------------------------------------------------------------------
-- Other paths in the bucket keep having no policies (service role only).

drop policy if exists "Users queue lexicon images" on storage.objects;
create policy "Users queue lexicon images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'moderation_queue'
    and (storage.foldername(name))[1] = 'lexicon'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Owners and admins read queued lexicon images" on storage.objects;
create policy "Owners and admins read queued lexicon images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'moderation_queue'
    and (storage.foldername(name))[1] = 'lexicon'
    and ((storage.foldername(name))[2] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "Owners and admins delete queued lexicon images" on storage.objects;
create policy "Owners and admins delete queued lexicon images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'moderation_queue'
    and (storage.foldername(name))[1] = 'lexicon'
    and ((storage.foldername(name))[2] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- Storage: animalImages (public read via public URLs, admin-only write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('animalImages', 'animalImages', true)
on conflict (id) do nothing;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%''animalImages''%'
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end
$$;

-- Deleting through the storage API also needs the rows to be selectable.
drop policy if exists "Admins read animal images" on storage.objects;
create policy "Admins read animal images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'animalImages' and public.is_admin());

drop policy if exists "Admins upload animal images" on storage.objects;
create policy "Admins upload animal images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'animalImages' and public.is_admin());

drop policy if exists "Admins update animal images" on storage.objects;
create policy "Admins update animal images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'animalImages' and public.is_admin())
  with check (bucket_id = 'animalImages' and public.is_admin());

drop policy if exists "Admins delete animal images" on storage.objects;
create policy "Admins delete animal images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'animalImages' and public.is_admin());

commit;
