-- Ejecuta este script en Supabase > SQL Editor.
-- Los visitantes pueden leer mensajes visibles y publicar mensajes nuevos.
-- Editar, ocultar y borrar mensajes queda reservado al administrador desde Supabase.

create table if not exists public.marmota_comments (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  pet_name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  visible boolean not null default true,
  constraint owner_name_length check (char_length(btrim(owner_name)) between 2 and 55),
  constraint pet_name_length check (char_length(btrim(pet_name)) between 2 and 70),
  constraint message_length check (char_length(btrim(message)) between 3 and 420)
);

create index if not exists marmota_comments_visible_created_idx
  on public.marmota_comments (created_at desc) where visible = true;

alter table public.marmota_comments enable row level security;

-- Limitar los permisos de la API pública a las columnas necesarias.
revoke all on public.marmota_comments from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select (id, owner_name, pet_name, message, created_at)
  on public.marmota_comments to anon, authenticated;
grant insert (owner_name, pet_name, message)
  on public.marmota_comments to anon, authenticated;

drop policy if exists "Leer comentarios visibles" on public.marmota_comments;
create policy "Leer comentarios visibles"
  on public.marmota_comments for select
  to anon, authenticated
  using (visible = true);

drop policy if exists "Publicar comentarios" on public.marmota_comments;
create policy "Publicar comentarios"
  on public.marmota_comments for insert
  to anon, authenticated
  with check (visible = true);

-- Moderación manual (ejecutar en SQL Editor como administrador):
-- update public.marmota_comments set visible = false where id = 'UUID-DEL-MENSAJE';
