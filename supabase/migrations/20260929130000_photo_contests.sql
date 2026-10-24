-- Weekly photo contests.
--
-- Each week one species is open for entries: users who have it in their
-- collection submit one photo each, and entries collect likes. The following
-- week the entries meet in a knockout bracket (4 to 64 photos, seeded by
-- likes) that the community votes on. The winning photo becomes the species'
-- lexicon image; an admin can veto that afterwards.
--
-- Contests, entries and matchups are written only by the server (service
-- role): entries after the image check, everything else by the daily advance
-- job (utils/contest/advanceContests.ts). Likes and votes are written with the
-- user's own session, so the policies below are what keep them honest.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  animal_id bigint not null references public.animals (id) on delete cascade,
  -- The Monday (UTC) the submission week starts; voting runs the week after.
  week_start date not null unique check (extract(isodow from week_start) = 1),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'submission', 'voting', 'finished', 'cancelled')),
  bracket_size integer check (bracket_size in (4, 8, 16, 32, 64)),
  winner_entry_id uuid,
  -- The animal's image and credit before the winner replaced them, for the veto.
  previous_image jsonb,
  -- Objects in animalImages the winning photo was copied to.
  published_paths text[] not null default '{}',
  vetoed_at timestamptz,
  scheduled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists contests_status_idx on public.contests (status, week_start);

create table if not exists public.contest_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- pending: waiting for image review. excluded: left out of the bracket by an
  -- admin. removed: taken down; it forfeits any matchup it is in.
  status text not null default 'pending'
    check (status in ('pending', 'active', 'excluded', 'removed')),
  seed integer,
  -- Objects in the contest bucket once the photo is live.
  thumb_path text,
  main_path text,
  license_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

create index if not exists contest_entries_contest_idx on public.contest_entries (contest_id, status);
create index if not exists contest_entries_user_idx on public.contest_entries (user_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contests_winner_entry_id_fkey') then
    alter table public.contests
      add constraint contests_winner_entry_id_fkey
      foreign key (winner_entry_id) references public.contest_entries (id) on delete set null;
  end if;
end
$$;

create table if not exists public.contest_entry_likes (
  entry_id uuid not null references public.contest_entries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create index if not exists contest_entry_likes_user_idx on public.contest_entry_likes (user_id);

create table if not exists public.contest_matchups (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests (id) on delete cascade,
  round integer not null check (round >= 1),
  slot integer not null check (slot >= 0),
  -- A null side is a bye, or an entry whose owner deleted their account.
  entry_a uuid references public.contest_entries (id) on delete set null,
  entry_b uuid references public.contest_entries (id) on delete set null,
  winner uuid references public.contest_entries (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  unique (contest_id, round, slot),
  check (ends_at > starts_at)
);

create table if not exists public.contest_votes (
  matchup_id uuid not null references public.contest_matchups (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_id uuid not null references public.contest_entries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (matchup_id, user_id)
);

create index if not exists contest_votes_user_idx on public.contest_votes (user_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.contest_entry_likes enable row level security;
alter table public.contest_matchups enable row level security;
alter table public.contest_votes enable row level security;

-- Contests, entries and matchups have no write policies: service role only.

drop policy if exists "Signed-in users read contests" on public.contests;
create policy "Signed-in users read contests"
  on public.contests for select
  to authenticated
  using (true);

drop policy if exists "Signed-in users read live entries" on public.contest_entries;
create policy "Signed-in users read live entries"
  on public.contest_entries for select
  to authenticated
  using (status = 'active' or user_id = auth.uid() or public.is_admin());

drop policy if exists "Signed-in users read matchups" on public.contest_matchups;
create policy "Signed-in users read matchups"
  on public.contest_matchups for select
  to authenticated
  using (true);

-- Likes: public counts; one per user and entry; only while the contest takes
-- entries, and never on your own photo.
drop policy if exists "Signed-in users read likes" on public.contest_entry_likes;
create policy "Signed-in users read likes"
  on public.contest_entry_likes for select
  to authenticated
  using (true);

drop policy if exists "Users like other open entries" on public.contest_entry_likes;
create policy "Users like other open entries"
  on public.contest_entry_likes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contest_entries e
      join public.contests c on c.id = e.contest_id
      where e.id = entry_id
        and e.status = 'active'
        and e.user_id <> auth.uid()
        and c.status = 'submission'
    )
  );

drop policy if exists "Users remove their likes" on public.contest_entry_likes;
create policy "Users remove their likes"
  on public.contest_entry_likes for delete
  to authenticated
  using (user_id = auth.uid());

revoke update on public.contest_entry_likes from anon, authenticated;

-- Whether the caller may vote for p_entry_id in p_matchup_id: the matchup is
-- open and undecided, the entry is one of its two live sides, and the caller
-- owns neither side. Security definer so it sees entries the caller cannot
-- (a removed opponent) without depending on the select policies.
create or replace function public.contest_can_vote(p_matchup_id uuid, p_entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contest_matchups m
    join public.contest_entries a on a.id = m.entry_a
    join public.contest_entries b on b.id = m.entry_b
    where m.id = p_matchup_id
      and m.winner is null
      and now() >= m.starts_at
      and now() < m.ends_at
      and p_entry_id in (m.entry_a, m.entry_b)
      and a.status = 'active'
      and b.status = 'active'
      and a.user_id <> auth.uid()
      and b.user_id <> auth.uid()
  );
$$;

revoke all on function public.contest_can_vote(uuid, uuid) from public, anon;
grant execute on function public.contest_can_vote(uuid, uuid) to authenticated;

-- Votes: users see only their own; a vote can be changed (entry_id only)
-- while the matchup is open.
drop policy if exists "Users read their votes" on public.contest_votes;
create policy "Users read their votes"
  on public.contest_votes for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users vote in open matchups" on public.contest_votes;
create policy "Users vote in open matchups"
  on public.contest_votes for insert
  to authenticated
  with check (user_id = auth.uid() and public.contest_can_vote(matchup_id, entry_id));

drop policy if exists "Users change open votes" on public.contest_votes;
create policy "Users change open votes"
  on public.contest_votes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.contest_can_vote(matchup_id, entry_id));

revoke update on public.contest_votes from anon, authenticated;
grant update (entry_id) on public.contest_votes to authenticated;

-- Vote counts of a contest's matchups: only for matchups that are over or
-- that the caller has already voted in, so open results cannot steer votes.
create or replace function public.contest_vote_counts(p_contest_id uuid)
returns table (matchup_id uuid, entry_id uuid, votes integer)
language sql
stable
security definer
set search_path = public
as $$
  select v.matchup_id, v.entry_id, count(*)::integer
  from public.contest_votes v
  join public.contest_matchups m on m.id = v.matchup_id
  where m.contest_id = p_contest_id
    and (
      m.winner is not null
      or m.ends_at <= now()
      or exists (
        select 1 from public.contest_votes own
        where own.matchup_id = m.id and own.user_id = auth.uid()
      )
    )
  group by v.matchup_id, v.entry_id;
$$;

revoke all on function public.contest_vote_counts(uuid) from public, anon;
grant execute on function public.contest_vote_counts(uuid) to authenticated;

-- Species for an automatic contest: the ones with the most collection photos
-- (likely the most entries) that have a lexicon image and had no contest in
-- the past year. For the advance job only.
create or replace function public.contest_candidates(p_week_start date, p_limit integer default 20)
returns table (animal_id bigint, photos integer)
language sql
stable
set search_path = public
as $$
  select s.animal_id, count(*)::integer as photos
  from public.spotted s
  join public.animals a on a.id = s.animal_id
  where s.image is true
    and a.lexicon_link is not null
    and not exists (
      select 1 from public.contests c
      where c.animal_id = s.animal_id and c.week_start > p_week_start - 364
    )
  group by s.animal_id
  order by photos desc, s.animal_id
  limit p_limit;
$$;

revoke all on function public.contest_candidates(date, integer) from public, anon, authenticated;
grant execute on function public.contest_candidates(date, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Moderation: contest photos go through the same image check
-- ---------------------------------------------------------------------------

alter table public.image_moderation drop constraint if exists image_moderation_kind_check;
alter table public.image_moderation
  add constraint image_moderation_kind_check
  check (kind in ('profile_picture', 'profile_grid', 'collection', 'contest_entry'));

-- ---------------------------------------------------------------------------
-- Storage: contest photos (public read, service role write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('contest', 'contest', true, array['image/jpeg', 'image/png', 'image/webp'], 2097152)
on conflict (id) do nothing;

commit;
