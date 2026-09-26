-- Fixes for the Supabase Security Advisor warnings: dashboard-made functions
-- without a fixed search_path, always-true write policies, and tables listed
-- in the GraphQL schema.

-- 1. Dashboard-made functions get a fixed search_path (Security Advisor lint
--    0011). The two sign-up triggers also run as their owner, so they can
--    insert into users without the open insert policy dropped below.
do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('limit_total_images', 'sync_auth_users_to_public', 'handle_new_user')
  loop
    execute format('alter function %s set search_path = public', fn);
  end loop;
  for fn in
    select p.oid::regprocedure from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('sync_auth_users_to_public', 'handle_new_user')
  loop
    execute format('alter function %s security definer', fn);
  end loop;
end $$;

-- 2. Insert/delete policies that allowed anything (lint 0024). Each row must
--    now belong to the caller, matching what the server actions write.
drop policy if exists "Enable insert for authenticated users only" on public.animallists;
create policy "Insert own lists" on public.animallists
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Enable insert for authenticated users only" on public.animallistitems;
create policy "Insert into own lists" on public.animallistitems
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.animallists l where l.id = list_id and l.user_id = auth.uid())
  );

drop policy if exists "Enable insert for authenticated users only" on public.follows;
create policy "Follow as yourself" on public.follows
  for insert to authenticated
  with check (follower_id = auth.uid());

drop policy if exists "Enable insert for authenticated users only" on public.listupvotes;
create policy "Upvote visible lists as yourself" on public.listupvotes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.animallists l
      where l.id = list_id and (l.is_public or l.user_id = auth.uid())
    )
  );

drop policy if exists "Enable insert for authenticated users only" on public.reports;
create policy "Report as yourself" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "Enable insert for authenticated users only" on public.spotted;
create policy "Insert own sightings" on public.spotted
  for insert to authenticated
  with check (user_id = auth.uid());

-- lastimages is written only by the service role (utils/moderation/publish.ts);
-- the open policies let any user insert fake feed entries or delete everyone's.
drop policy if exists "Enable insert for authenticated users only" on public.lastimages;
drop policy if exists "Enable delete access for all users" on public.lastimages;

-- users rows come from the sign-up trigger (security definer above); the open
-- policy let anyone, even signed-out, insert rows.
drop policy if exists "Enable insert access for all users" on public.users;

-- 3. The app never uses GraphQL; without the extension the schema is no
--    longer listed to anon and signed-in users (lints 0026/0027).
drop extension if exists pg_graphql;
