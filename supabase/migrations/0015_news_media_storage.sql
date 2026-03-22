insert into storage.buckets (id, name, public)
values ('news-media', 'news-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read news media" on storage.objects;
create policy "Public can read news media"
on storage.objects
for select
using (bucket_id = 'news-media');
