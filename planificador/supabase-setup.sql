-- =============================================
-- PLANIFICADOR - Supabase Setup
-- =============================================
-- Pega esto en el SQL Editor de Supabase y dale "Run"
-- Solo necesitas hacerlo UNA VEZ

-- Tabla principal: guarda todo como JSON por clave
create table if not exists planner_data (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'eleazar',
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, key)
);

-- Índice para búsquedas rápidas
create index if not exists idx_planner_user_key on planner_data(user_id, key);

-- Función para auto-actualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger planner_data_updated
  before update on planner_data
  for each row execute function update_updated_at();

-- Habilitar Row Level Security (seguridad)
alter table planner_data enable row level security;

-- Política: cualquiera con el anon key puede leer/escribir
-- (es seguro porque solo tú tienes la URL + key)
create policy "Allow all access" on planner_data
  for all using (true) with check (true);
