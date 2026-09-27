import { cookies } from "next/headers";
import { getUser } from "./store";
import type { User } from "./types";

// Sesión mock (v1). Un cookie guarda el userId. Reemplazable por Pollar (OTP).
// El admin usa un login aparte con credenciales de entorno (solo demo).

const COOKIE = "pulso_session";

const ADMIN_USER: User = {
  id: "admin",
  role: "admin",
  email: process.env.ADMIN_EMAIL ?? "admin@pulso.com",
  displayName: "Administrador",
  createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
};

export async function getSession(): Promise<User | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;
  if (id === "admin") return ADMIN_USER;
  return (await getUser(id)) ?? null;
}

export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Verifica credenciales de admin (solo demo). ADMIN_PASSWORD_PLAIN se usa
 * únicamente en desarrollo; en producción debe reemplazarse por hash + rol real.
 */
export function checkAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pulso.com";
  const adminPass = process.env.ADMIN_PASSWORD_PLAIN ?? "12341234";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPass;
}

export function requireRole(user: User | null, ...roles: User["role"][]): boolean {
  return !!user && roles.includes(user.role);
}
