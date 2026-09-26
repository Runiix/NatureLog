-- Security hardening: closes paths that bypass the server actions by talking
-- to PostgREST or Storage directly with the public anon key.

-- 1. Buckets accept only the image types validateImage produces, within its
--    2 MB cap. Storage enforces this even for direct uploads, e.g. an .svg
--    written straight into a user's lexicon queue folder.
update storage.buckets
   set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
       file_size_limit = 2097152
 where id in ('moderation_queue', 'animalImages', 'profiles', 'imagesearch');

-- 2. Update policies protect rows, not columns. Owners may only change the
--    columns the settings actions write; counters (spotted_count, maintained
--    by triggers) and user_id stay server-side. Service role is unaffected.
revoke update on public.profiles from anon, authenticated;
grant update (favorite_animal, hide_invertebrates, insta_link, is_public, profile_picture, team_link)
  on public.profiles to authenticated;

revoke update on public.spotted from anon, authenticated;
grant update (first_spotted_at) on public.spotted to authenticated;

-- 3. Only signed-in users need these helpers.
revoke execute on function public.is_admin() from anon;
revoke execute on function public.lexicon_pending_count() from anon;

-- 4. Username rules from app/[locale]/utils/credentials.ts (USERNAME_PATTERN),
--    enforced where a direct auth.signUp() cannot skip them: the sign-up
--    trigger's insert into users fails for an invalid or taken name.
--    NOT VALID leaves existing rows alone; new and changed rows are checked.
alter table public.users
  add constraint users_display_name_format
  check (display_name ~ '^[A-Za-z0-9._-]{3,30}$') not valid;
create unique index if not exists users_display_name_lower_key
  on public.users (lower(display_name));

-- 5. Reports record who filed them (accountability) and a user can report
--    the same image only once (spam). user_id stays the reported owner.
alter table public.reports
  add column if not exists reporter_id uuid default auth.uid()
  references auth.users (id) on delete set null;
create unique index if not exists reports_reporter_image_key
  on public.reports (reporter_id, image_link);
