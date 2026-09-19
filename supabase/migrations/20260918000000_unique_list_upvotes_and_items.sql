-- One upvote per user per list, one row per animal per list.
--
-- The app used to insert upvotes without checking for an existing row, so a
-- double click stored two, and every count derived from row counts was
-- inflated. The actions are now idempotent, but only a constraint makes that
-- hold under concurrent requests. Duplicates must be removed first or the
-- index build fails.

begin;

-- Keep one row of each (user_id, list_id) pair (created_at is nullable, so
-- ctid is the tie-breaker).
delete from public.listupvotes a
using public.listupvotes b
where a.user_id = b.user_id
  and a.list_id = b.list_id
  and a.ctid > b.ctid;

create unique index if not exists listupvotes_user_list_key
  on public.listupvotes (user_id, list_id);

-- Keep one row of each (list_id, animal_id) pair.
delete from public.animallistitems a
using public.animallistitems b
where a.list_id = b.list_id
  and a.animal_id = b.animal_id
  and a.id > b.id;

create unique index if not exists animallistitems_list_animal_key
  on public.animallistitems (list_id, animal_id);

commit;
