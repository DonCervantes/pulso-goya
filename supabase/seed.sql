-- Pulso — datos semilla (demo). Ejecutar después de 0001_init.sql.

insert into ambulance_numbers (id, zone, name, phone, is_public) values
  ('amb_cruzroja','CDMX','Cruz Roja Mexicana','065',true),
  ('amb_erum','CDMX','ERUM (SSC) / 911','911',true),
  ('amb_locatel','CDMX','Locatel','5556581111',true),
  ('amb_privada','CDMX','Ambulancia privada (ejemplo)','5500000000',false)
on conflict (id) do nothing;

insert into places (id, type, name, address, phone, zone, source) values
  ('ph1','pharmacy','Farmacia del Ahorro — Roma','Av. Álvaro Obregón 100, Roma Nte.','5552000000','Cuauhtémoc','seed'),
  ('ph2','pharmacy','Farmacias Guadalajara — Condesa','Av. Tamaulipas 55, Condesa','5552000001','Cuauhtémoc','seed'),
  ('ph3','pharmacy','Farmacia San Pablo — Del Valle','Av. Coyoacán 300, Del Valle','5552000002','Benito Juárez','seed'),
  ('ho1','hospital','Hospital General de México','Dr. Balmis 148, Doctores','5527892000','Cuauhtémoc','seed'),
  ('ho2','hospital','IMSS — Clínica 25','Av. Universidad 500, Narvarte','5555550000','Benito Juárez','seed'),
  ('ho3','hospital','Cruz Roja — Polanco','Av. Ejército Nacional 1032, Polanco','5553951111','Miguel Hidalgo','seed'),
  ('dr1','doctor','Dra. María López — Medicina interna','Consultorio, Roma Nte.','5551110000','Cuauhtémoc','seed'),
  ('dr2','doctor','Dr. Jorge Díaz — Cardiología','Consultorio, Del Valle','5551110001','Benito Juárez','seed')
on conflict (id) do nothing;

insert into users (id, role, email, display_name, phone, address, zone, preferred_ambulance_ids, consent_version, created_at) values
  ('u_ana','user','ana@ejemplo.mx','Ana (usuaria demo)','5551234567','Calle Ejemplo 123, Roma Nte., Cuauhtémoc','Cuauhtémoc','{amb_cruzroja,amb_erum}','v1','2026-09-20T10:00:00Z'),
  ('f_luis','family','luis@ejemplo.mx','Luis (familiar demo)',null,null,null,'{}',null,'2026-09-20T11:00:00Z')
on conflict (id) do nothing;

insert into contacts (id, user_id, name, email, relationship, verified_at, linked_user_id) values
  ('00000000-0000-0000-0000-0000000000c1','u_ana','Luis (hijo)','luis@ejemplo.mx','Hijo','2026-09-20T11:05:00Z','f_luis'),
  ('00000000-0000-0000-0000-0000000000c2','u_ana','Rosa (vecina)','rosa@ejemplo.mx','Vecina','2026-09-21T09:00:00Z',null)
on conflict (id) do nothing;
