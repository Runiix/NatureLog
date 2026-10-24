-- Species sets: public lists an admin has promoted to collectable sets
-- ("Gartenvögel 30"). The list is the set's content, so the normal list
-- editor maintains it; this table only marks which lists are sets and in which
-- order they are shown.

begin;

create table if not exists public.species_sets (
  list_id uuid primary key references public.animallists (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.species_sets enable row level security;

drop policy if exists "Signed-in users read species sets" on public.species_sets;
create policy "Signed-in users read species sets"
  on public.species_sets for select
  to authenticated
  using (true);

-- Only public lists can become sets: everyone has to be able to read them.
drop policy if exists "Admins promote public lists" on public.species_sets;
create policy "Admins promote public lists"
  on public.species_sets for insert
  to authenticated
  with check (
    public.is_admin()
    and exists (select 1 from public.animallists l where l.id = list_id and l.is_public)
  );

drop policy if exists "Admins reorder sets" on public.species_sets;
create policy "Admins reorder sets"
  on public.species_sets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins remove sets" on public.species_sets;
create policy "Admins remove sets"
  on public.species_sets for delete
  to authenticated
  using (public.is_admin());

commit;
