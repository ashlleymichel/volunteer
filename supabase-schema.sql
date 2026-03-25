-- =============================================
-- VOLUNTEER APP — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- =============================================

-- ── PROFILES (dados do usuário logado) ──────
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  whatsapp    text default '',
  role        text not null default 'voluntario', -- 'voluntario' | 'lider'
  area_roles  jsonb default '{}'::jsonb,          -- { "audio": "lider", "projecao": "voluntario" }
  updated_at  timestamptz default now()
);

-- ── MEMBERS (voluntários cadastrados) ────────
create table if not exists public.members (
  id      text primary key,          -- uuid gerado pelo app (pode ser o user_id do auth)
  name    text not null default '',
  email   text default '',
  phone   text default '',
  areas   jsonb default '[]'::jsonb,  -- ["audio", "projecao"]
  role    text not null default 'voluntario'
);

-- ── EVENTS (eventos com sessões) ─────────────
create table if not exists public.events (
  id        text primary key,
  name      text not null default '',
  date      text default '',          -- "YYYY-MM-DD"
  time      text default '',          -- "HH:MM" (compat legado)
  leader    text default '',
  areas     jsonb default '[]'::jsonb,
  sessions  jsonb default '[]'::jsonb, -- [{ id, time, volunteers: { areaKey: [memberId] } }]
  cover     text default ''
);

-- ── ROW LEVEL SECURITY ───────────────────────
alter table public.profiles enable row level security;
alter table public.members  enable row level security;
alter table public.events   enable row level security;

-- Profiles: cada usuário lê/escreve apenas o próprio perfil
create policy "Usuário lê próprio perfil"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Usuário edita próprio perfil"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Members: qualquer usuário autenticado lê; apenas autenticados escrevem
create policy "Autenticados lêem membros"
  on public.members for select
  using (auth.role() = 'authenticated');

create policy "Autenticados inserem membros"
  on public.members for insert
  with check (auth.role() = 'authenticated');

create policy "Autenticados atualizam membros"
  on public.members for update
  using (auth.role() = 'authenticated');

create policy "Autenticados removem membros"
  on public.members for delete
  using (auth.role() = 'authenticated');

-- Events: qualquer usuário autenticado lê; apenas autenticados escrevem
create policy "Autenticados lêem eventos"
  on public.events for select
  using (auth.role() = 'authenticated');

create policy "Autenticados inserem eventos"
  on public.events for insert
  with check (auth.role() = 'authenticated');

create policy "Autenticados atualizam eventos"
  on public.events for update
  using (auth.role() = 'authenticated');

create policy "Autenticados removem eventos"
  on public.events for delete
  using (auth.role() = 'authenticated');
