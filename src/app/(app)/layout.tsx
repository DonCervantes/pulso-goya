import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import Logo from "@/components/Logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const navByRole: Record<string, { href: string; label: string }[]> = {
    user: [
      { href: "/inicio", label: "Inicio" },
      { href: "/chequeo", label: "Chequeo" },
      { href: "/contactos", label: "Contactos" },
      { href: "/recomendaciones", label: "Recomendaciones" },
    ],
    family: [{ href: "/familiar", label: "Alertas" }],
    admin: [{ href: "/admin", label: "Dashboard" }],
  };
  const nav = navByRole[user.role] ?? [];

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--color-border-soft)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Logo href="/" />
          <nav className="flex flex-1 flex-wrap gap-x-3 gap-y-1 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-[var(--color-text)] hover:underline">
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="text-sm text-[var(--color-text-secondary)]">{user.displayName}</span>
          <form action={logout}>
            <button className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-sm">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-[var(--color-border-soft)] px-4 py-3 text-center text-xs text-[var(--color-text-secondary)]">
        Pulso es un prototipo · No sustituye una llamada al 911 · Aviso a autoridades simulado
      </footer>
    </div>
  );
}
