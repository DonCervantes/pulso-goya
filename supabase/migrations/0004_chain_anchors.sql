-- Pulso — anclaje en Stellar. case_key por incidente + registro de anclajes.
-- Nada personal va a la cadena; aquí guardamos el vínculo case_key↔incidente,
-- el nonce y el commitment (fuera de cadena) para poder auditar.

alter table incidents add column if not exists case_key text;

create table if not exists chain_anchors (
  id            uuid primary key default gen_random_uuid(),
  incident_id   text not null references incidents(id) on delete cascade,
  case_key      text not null,
  anchor_seq    int not null,
  event_code    int not null,
  commitment    text not null,
  nonce         text not null,
  server_received_at_unix bigint not null,
  tx_hash       text,
  ledger        bigint,
  status        text not null default 'pending' check (status in ('pending','confirmed','failed')),
  error         text,
  created_at    timestamptz not null default now(),
  unique (incident_id, anchor_seq)
);
create index if not exists chain_anchors_incident_idx on chain_anchors (incident_id);
alter table chain_anchors enable row level security;
