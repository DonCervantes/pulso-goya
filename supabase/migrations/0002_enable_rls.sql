-- Pulso — habilitar RLS en todas las tablas públicas (v1).
-- El backend usa service_role (omite RLS), así que la app no cambia.
-- Con RLS activado y sin políticas, la clave pública (anon) queda denegada.
-- Las políticas por rol se agregan en el ticket V07.

alter table users enable row level security;
alter table contacts enable row level security;
alter table family_invites enable row level security;
alter table incidents enable row level security;
alter table incident_events enable row level security;
alter table notifications enable row level security;
alter table daily_checkins enable row level security;
alter table places enable row level security;
alter table ambulance_numbers enable row level security;
alter table audit_log enable row level security;
