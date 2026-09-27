import Image from "next/image";
import { loginAdmin } from "@/app/actions";
import PollarLoginButton from "@/components/PollarLoginButton";
import Logo from "@/components/Logo";

const POLLAR_ENABLED = !!process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
      {/* Branding (marca + dispositivo) */}
      <aside className="hidden flex-col gap-6 lg:flex">
        <Logo href="/" />
        <h2 className="text-3xl font-extrabold leading-tight">
          Tu red de apoyo, cuando más importa.
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Un botón sencillo para pedir ayuda, una familia que se organiza y un chequeo diario de
          bienestar.
        </p>
        <div className="relative flex justify-center">
          <div aria-hidden className="absolute inset-0 -z-10 m-auto h-56 w-56 rounded-full bg-[var(--color-primary)]/15 blur-3xl" />
          <Image
            src="/collar-pulso.png"
            alt="Collar Pulso: dispositivo con módulo ESP32, botón de ayuda y batería"
            width={236}
            height={413}
            priority
            className="h-auto w-44 drop-shadow-2xl"
          />
        </div>
      </aside>

      {/* Columna de acceso */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between lg:hidden">
          <Logo href="/" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Entrar a Pulso</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Entra con tu correo. Recibirás un código y se creará tu cuenta de forma segura.
          </p>
        </div>

        {error === "admin" && (
          <p role="alert" className="rounded-lg border border-[var(--color-danger)] bg-white p-3 text-[var(--color-danger)]">
            Credenciales de administrador incorrectas.
          </p>
        )}

        {/* Login con Pollar (OTP por correo + wallet Stellar) */}
        {POLLAR_ENABLED ? (
          <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold">Entrar con tu correo</h2>
            <p className="mt-1 mb-3 text-sm text-[var(--color-text-secondary)]">
              Código de un solo uso (OTP) con wallet segura. Para cuentas nuevas te pediremos algunos
              datos.
            </p>
            <PollarLoginButton />
          </section>
        ) : (
          <p className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
            El inicio de sesión por correo aún no está configurado.
          </p>
        )}

        {/* Acceso de administrador */}
        <details className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-secondary)]">
            Acceso de administrador
          </summary>
          <form action={loginAdmin} className="mt-3 flex flex-col gap-2">
            <input
              name="email"
              type="email"
              defaultValue="admin@pulso.com"
              placeholder="Correo"
              className="rounded-lg border border-[var(--color-border)] p-3"
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              className="rounded-lg border border-[var(--color-border)] p-3"
            />
            <button className="rounded-lg bg-[var(--color-text)] px-4 py-3 font-semibold text-white">
              Entrar como admin
            </button>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Acceso al panel de operación. En producción se reemplaza por rol real con contraseña por
              usuario y MFA.
            </p>
          </form>
        </details>
      </div>
    </main>
  );
}
