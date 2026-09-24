-- Invertebrates: a per-user switch to hide them, and separate sighting counts.
--
-- The lexicon now has three invertebrate groups (Insekt, Arachnoid, Sonstige
-- Wirbellose). They are curated rather than complete, so they are counted
-- apart from vertebrates: `spotted_count` (shown and ranked on) counts
-- vertebrates only, `spotted_invertebrate_count` counts the rest.
--
-- The dashboard-created increment/decrement RPCs are replaced by a trigger
-- that recounts from `spotted`, so the counts cannot drift and deleting
-- animals (with their sightings) keeps them right without extra calls.

begin;

alter table public.profiles
  add column if not exists hide_invertebrates boolean not null default false,
  add column if not exists spotted_invertebrate_count integer not null default 0;

-- Recounts one user's sightings. Security definer so it can update the
-- profile regardless of who removed the sighting (e.g. an admin deleting an
-- animal).
create or replace function public.refresh_spotted_counts(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles p
  set
    spotted_count = counts.vertebrates,
    spotted_invertebrate_count = counts.invertebrates
  from (
    select
      count(*) filter (
        where coalesce(a.category, '') not in ('Insekt', 'Arachnoid', 'Sonstige Wirbellose')
      )::integer as vertebrates,
      count(*) filter (
        where a.category in ('Insekt', 'Arachnoid', 'Sonstige Wirbellose')
      )::integer as invertebrates
    from public.spotted s
    left join public.animals a on a.id = s.animal_id
    where s.user_id = p_user_id
  ) counts
  where p.user_id = p_user_id;
$$;

revoke all on function public.refresh_spotted_counts(uuid) from public, anon, authenticated;

create or replace function public.spotted_counts_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_spotted_counts(old.user_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.user_id is distinct from old.user_id) then
    perform public.refresh_spotted_counts(new.user_id);
  end if;
  return null;
end;
$$;

drop trigger if exists spotted_counts on public.spotted;
create trigger spotted_counts
  after insert or delete or update of user_id, animal_id on public.spotted
  for each row execute function public.spotted_counts_trigger();

-- Backfill every profile with the new split.
select public.refresh_spotted_counts(user_id) from public.profiles where user_id is not null;

drop function if exists public.increment_spotted_count(uuid);
drop function if exists public.decrement_spotted_count(uuid);

commit;
