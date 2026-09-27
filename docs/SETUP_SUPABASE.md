# Conectar Supabase (persistencia real)

La app funciona en modo **mock** (memoria) sin configurar nada. Para activar persistencia
real con Supabase, sigue estos pasos. Al detectar las variables, la app cambia sola de
backend (mock → Supabase); no hay que tocar código.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Elige nombre (ej. `pulso`), contraseña de la base y región (ej. `East US` o la más cercana a MX).
3. Espera a que termine de aprovisionar (~2 min).

## 2. Crear el esquema y los datos semilla

En el panel de Supabase → **SQL Editor** → **New query**:

1. Pega el contenido de [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) y ejecuta (**Run**).
2. Pega el contenido de [`supabase/seed.sql`](../supabase/seed.sql) y ejecuta.

Deberías ver las tablas en **Table Editor** (`users`, `incidents`, `places`, etc.) con los
datos de demo (Ana, Luis, farmacias, ambulancias).

## 3. Copiar las claves

En **Project Settings → API**:

- **Project URL** → variable `NEXT_PUBLIC_SUPABASE_URL`
- **service_role** (en "Project API keys", NO la `anon`) → variable `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ La `service_role` es secreta y omite RLS. Solo va en el servidor. Nunca la subas a git
> ni la uses con el prefijo `NEXT_PUBLIC_`.

## 4. Pegar las variables

Copia `.env.example` a `.env.local` (si no lo has hecho) y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## 5. Reiniciar

Detén y vuelve a correr `pnpm dev`. La app ahora lee y escribe en Supabase.

Verifícalo: crea un incidente (botón de pánico) y confirma que aparece en el **Table Editor**
de Supabase, tabla `incidents`, y que persiste aunque reinicies el servidor.

## Notas

- El login sigue siendo mock (por rol) hasta integrar Pollar; los usuarios viven en la tabla
  `users`.
- RLS: en v1 el acceso es por service role desde el backend. El endurecimiento de RLS por rol
  es el ticket **V07** de la especificación.
- En Vercel, agrega estas dos variables en **Project → Settings → Environment Variables**
  (preview y production).
