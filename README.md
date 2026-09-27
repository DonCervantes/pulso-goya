# Pulso — Tu red de apoyo en dos toques

Plataforma para que **adultos mayores y personas con enfermedades** pidan ayuda con un botón
sencillo: su **red familiar** se entera y se organiza, con un **chequeo diario** de bienestar y
recomendaciones de salud. Prototipo con piloto propuesto en **Ciudad de México**.

> ⚠️ **Prototipo.** Pulso **no** es una central de emergencias ni tiene convenio con autoridades.
> El aviso automatizado a autoridades es **simulado**. En una urgencia real, llama al **911**.

- 🔗 **Demo en vivo (Vercel):** _pendiente de desplegar_ · <!-- DEPLOY_URL -->
- 📦 **Repositorio:** https://github.com/DonCervantes/pulso-goya
- 📄 **White paper / especificación:** [`docs/PULSO_MASTER_SPEC.md`](docs/PULSO_MASTER_SPEC.md)

---

## ✨ Funcionalidad por rol

**Usuario (adulto mayor)**
- Botón de pánico web ("mantener 2 s") que crea un incidente idempotente.
- Onboarding/KYC: nombre, edad, zona, domicilio, datos médicos y **ambulancias preferidas** (puede agregar la suya).
- Chequeo diario `pulso_daily_v1` (índice 0–100) con señales de alarma previas.
- Recomendaciones de salud con **IA (Groq)** personalizadas a su tendencia + farmacias/hospitales.
- Enlaces de invitación para su círculo familiar.

**Familiar / cuidador**
- Recibe la alerta por **correo (Resend)** y en el panel.
- Confirma recepción, ve ambulancias, registra la llamada al 911 y cierra el caso.

**Administrador**
- Dashboard con métricas del piloto.
- Recomendaciones generales con **IA (Groq)** a partir de métricas agregadas (sin datos clínicos individuales).

En cada incidente, Pulso ancla la **secuencia verificable** (`OPENED → FAMILY_ACK → CLOSED`) en
**Stellar**, sin datos personales.

---

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Web / API | Next.js 16 (App Router) + TypeScript, Tailwind CSS 4 |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Autenticación | Pollar (OTP por correo + wallet Stellar embebida) · admin con credencial fija (demo) |
| Correo | Resend |
| IA | Groq (`openai/gpt-oss-20b`) |
| Blockchain | Stellar / Soroban (Rust) en **testnet** |
| Deploy | Vercel |

---

## ⛓️ Smart contract (Stellar testnet)

Contrato Soroban que deja una constancia verificable de cada incidente. **No recibe datos
personales ni clínicos** (solo un `case_key` aleatorio y un `commitment` hash).

| Dato | Valor |
|---|---|
| **Contract ID** | `CABVFOI7JX4NSOITTXQHQYYYTX5LNMVCFSINZINTEGMV5SOUITZBFJPV` |
| **Explorador (contrato)** | https://stellar.expert/explorer/testnet/contract/CABVFOI7JX4NSOITTXQHQYYYTX5LNMVCFSINZINTEGMV5SOUITZBFJPV |
| **Cuenta de servicio (admin del contrato)** | `GAQQI5GZT2GDDEM27UYTULBGXDS7BQDN2TRI6ZOORCPHRIQIMVFO5WHT` |
| **Explorador (cuenta)** | https://stellar.expert/explorer/testnet/account/GAQQI5GZT2GDDEM27UYTULBGXDS7BQDN2TRI6ZOORCPHRIQIMVFO5WHT |
| **Red / RPC** | testnet · `https://soroban-testnet.stellar.org` |

Funciones: `initialize(admin)`, `record_event(case_key, seq, event_code, server_received_at_unix, commitment)`, `get_case_state(case_key)`.
Código: [`contract/contracts/pulso-incidents/src/lib.rs`](contract/contracts/pulso-incidents/src/lib.rs) · Datos del despliegue: [`contract/deployment.testnet.json`](contract/deployment.testnet.json).

```bash
# Compilar y probar el contrato
cd contract
cargo test
stellar contract build
```

---

## 🚀 Correr en local

```bash
pnpm install
cp .env.example .env.local   # y rellena tus claves
pnpm dev
```

Abre http://localhost:3000. Sin claves, la app corre en **modo mock** (datos en memoria, correos en
consola). Con las variables configuradas, usa los servicios reales.

### Variables de entorno

Ver [`.env.example`](.env.example). Resumen:

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Base de datos |
| `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`, `POLLAR_SECRET_KEY` | Auth Pollar |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Correos |
| `GROQ_API_KEY`, `GROQ_MODEL` | Recomendaciones IA |
| `STELLAR_NETWORK`, `STELLAR_RPC_URL`, `STELLAR_CONTRACT_ID`, `STELLAR_SERVICE_SECRET` | Anclaje en Stellar |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_PLAIN` | Acceso admin (solo demo) |

> Los secretos viven solo en `.env.local` (ignorado por git). Nunca uses el prefijo `NEXT_PUBLIC_` para claves privadas.

### Supabase

Guía paso a paso: [`docs/SETUP_SUPABASE.md`](docs/SETUP_SUPABASE.md). Migraciones y seed en
[`supabase/`](supabase/).

---

## 📁 Estructura

```
src/
  app/            # rutas (landing, login, onboarding, app por rol, API)
  components/     # PanicButton, CheckinFlow, IncidentDetail, AIRecommendations, ...
  lib/            # store (Supabase/mock), stellar, groq, email, session, ...
contract/         # contrato Soroban (Rust) + despliegue
supabase/         # migraciones SQL + seed
docs/             # especificación maestra y setup
```

---

## ✅ Estado (tickets)

**Hecho:** Supabase (M02), Pollar + roles + onboarding/KYC (M03–M04), botón de pánico (M05),
Resend + panel familiar + acuse/cierre (M06), 911 simulado + ambulancias (M07), chequeo diario
(M08), recomendaciones/lugares mock (M09), dashboard admin (V04), contrato Soroban + anclaje
(V05–V06), IA Groq usuario/admin (V02–V03).

**Pendiente:** Google Places real (V01), endurecimiento de privacidad/RLS/cifrado (V07), PWA +
accesibilidad (V08), outbox durable y conciliación (refuerzo de M06/V06).

**Futuro:** collar ESP32, widget nativo Android, ubicación en tiempo real, integración real con autoridades.

---

## 🔒 Privacidad y límites

- Datos de salud tratados como sensibles (LFPDPPP). El usuario decide qué comparte.
- **Nada personal/clínico va a Stellar**: solo un identificador aleatorio y un hash.
- El aviso a autoridades es **simulado**; solo el correo al familiar y el registro de llamada son reales.
- Credencial de admin fija = **solo demo**; en producción se reemplaza por rol real con hash + MFA.

---

*Pulso es un prototipo de hackathon. No sustituye una llamada al 911.*
