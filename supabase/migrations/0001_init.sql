-- Pulso — esquema inicial (Supabase / Postgres)
-- Mapea a docs/PULSO_MASTER_SPEC.md §6.4. Ejecutar en el SQL Editor de Supabase.
-- v1: el backend accede con service role; RLS se endurece en v2 (ticket V07).

create extension if not exists "pgcrypto";

-- ── Usuarios ──────────────────────────────────────────────────
create table if not exists users (
  id            text primary key,
  role          text not null check (role in ('user','family','admin')),
  email         text not null,
  display_name  text not null,
  phone         text,
  address       text,
  zone          text,
  preferred_ambulance_ids text[] default '{}',
  consent_version text,
  created_at    timestamptz not null default now()
);
create unique index if not exists users_email_idx on users (lower(email));

-- ── Contactos ─────────────────────────────────────────────────
create table if not exists contacts (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references users(id) on delete cascade,
  name          text not null,
  email         text not null,
  relationship  text,
  verified_at   timestamptz,
  linked_user_id text references users(id)
);
create index if not exists contacts_user_idx on contacts (user_id);
create index if not exists contacts_linked_idx on contacts (linked_user_id);

-- ── Invitaciones familiares ───────────────────────────────────
create table if not exists family_invites (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references users(id) on delete cascade,
  token         text not null unique,
  email         text,
  status        text not null default 'pending' check (status in ('pending','accepted','expired')),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  accepted_by   text references users(id)
);

-- ── Incidentes ────────────────────────────────────────────────
create table if not exists incidents (
  id            text primary key,
  user_id       text not null references users(id) on delete cascade,
  source_channel text not null default 'web' check (source_channel in ('web','esp32')),
  status        text not null default 'created'
                check (status in ('created','family_acknowledged','contacting','resolved','false_alarm')),
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz,
  close_reason  text,
  client_event_id text not null unique,        -- idempotencia
  ambulance_snapshot jsonb not null default '[]'::jsonb
);
create index if not exists incidents_user_idx on incidents (user_id);

create table if not exists incident_events (
  id            uuid primary key default gen_random_uuid(),
  incident_id   text not null references incidents(id) on delete cascade,
  seq           int not null,
  type          text not null,
  actor_id      text,
  at            timestamptz not null default now(),
  note          text,
  unique (incident_id, seq)
);

-- ── Notificaciones ────────────────────────────────────────────
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  incident_id   text not null references incidents(id) on delete cascade,
  contact_id    text not null,
  contact_name  text not null,
  contact_email text not null,
  channel       text not null default 'email',
  status        text not null default 'queued' check (status in ('queued','sent','failed','acknowledged')),
  attempts      int not null default 0,
  provider_id   text,
  updated_at    timestamptz not null default now()
);
create index if not exists notifications_incident_idx on notifications (incident_id);

-- ── Chequeo diario ────────────────────────────────────────────
create table if not exists daily_checkins (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references users(id) on delete cascade,
  local_day     text not null,                 -- YYYY-MM-DD America/Mexico_City
  answers       jsonb not null,
  wants_contact boolean not null default false,
  alarm_signal  boolean not null default false,
  score_version text not null,
  score_0_100   int,                           -- null si incompleto
  completed_at  timestamptz not null default now(),
  unique (user_id, local_day)
);

-- ── Lugares y ambulancias ─────────────────────────────────────
create table if not exists places (
  id      text primary key,
  type    text not null check (type in ('pharmacy','hospital','doctor')),
  name    text not null,
  address text not null,
  phone   text,
  zone    text not null,
  source  text not null default 'seed'
);

create table if not exists ambulance_numbers (
  id        text primary key,
  zone      text not null,
  name      text not null,
  phone     text not null,
  is_public boolean not null default true
);

-- ── Auditoría ─────────────────────────────────────────────────
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    text,
  action      text not null,
  object_type text,
  object_id   text,
  at          timestamptz not null default now()
);
