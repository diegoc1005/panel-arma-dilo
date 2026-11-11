-- Tabla de notas compartidas del proyecto
create table notes (
  id bigint primary key generated always as identity,
  content text not null,
  author_id integer not null,
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tiempo real
alter publication supabase_realtime add table notes;

-- RLS público
alter table notes enable row level security;
create policy "acceso_publico_notes" on notes for all using (true) with check (true);
