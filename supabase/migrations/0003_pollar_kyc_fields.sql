-- Pulso — campos para Pollar (wallet, subject) y onboarding/KYC.
-- Datos médicos (blood_type, allergies, conditions) son sensibles: en v2 se cifran
-- y se restringe su acceso por rol (ticket V07). En v1 se guardan en claro para la demo.

alter table users add column if not exists wallet_address text;
alter table users add column if not exists pollar_subject text;
alter table users add column if not exists age int;
alter table users add column if not exists blood_type text;
alter table users add column if not exists allergies text;
alter table users add column if not exists conditions text;
alter table users add column if not exists onboarded boolean not null default false;

update users set onboarded = true where id in ('u_ana','f_luis');

create index if not exists users_wallet_idx on users (wallet_address);
