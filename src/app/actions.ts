"use server";

import { redirect } from "next/navigation";
import { checkAdminCredentials, clearSession, getSession, setSession } from "@/lib/session";
import { acceptInvite, completeOnboarding, createAmbulance, getUserByEmail } from "@/lib/store";

// Login mock por rol (v1). Reemplazable por Pollar OTP.
export async function loginAsUser(userId: string) {
  await setSession(userId);
  redirect("/inicio");
}

export async function loginAsFamily(userId: string) {
  await setSession(userId);
  redirect("/familiar");
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkAdminCredentials(email, password)) {
    redirect("/login?error=admin");
  }
  await setSession("admin");
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "");
  const name = String(formData.get("name") ?? "");
  if (!token || !email || !name) redirect(`/invitacion/${token}?error=1`);
  const familyUser = await acceptInvite(token, email, name);
  if (!familyUser) redirect(`/invitacion/${token}?error=expired`);
  await setSession(familyUser.id);
  redirect("/familiar");
}

export async function completeOnboardingAction(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/login");
  const ambulanceIds = formData.getAll("ambulances").map(String);
  const ageRaw = String(formData.get("age") ?? "").trim();

  // Ambulancias personalizadas que el usuario agregó (nombre + teléfono).
  // Se guardan como privadas (zona `priv:<userId>`) para no aparecer en las
  // listas públicas de otros usuarios; se referencian por su id en las preferidas.
  const customNames = formData.getAll("customAmbName").map(String);
  const customPhones = formData.getAll("customAmbPhone").map(String);
  const createdAmbulanceIds: string[] = [];
  for (let i = 0; i < customNames.length; i++) {
    const name = (customNames[i] ?? "").trim();
    const phone = (customPhones[i] ?? "").trim();
    if (name && phone) {
      const amb = await createAmbulance({
        name,
        phone,
        zone: `priv:${user.id}`,
        isPublic: false,
      });
      createdAmbulanceIds.push(amb.id);
    }
  }

  await completeOnboarding(user.id, {
    displayName: String(formData.get("displayName") ?? "").trim() || user.displayName,
    age: ageRaw ? Number(ageRaw) : undefined,
    zone: String(formData.get("zone") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined,
    bloodType: String(formData.get("bloodType") ?? "").trim() || undefined,
    allergies: String(formData.get("allergies") ?? "").trim() || undefined,
    conditions: String(formData.get("conditions") ?? "").trim() || undefined,
    preferredAmbulanceIds: [...ambulanceIds, ...createdAmbulanceIds],
  });
  redirect("/inicio");
}

// Helper para la demo: iniciar sesión rápido por email.
export async function quickLoginByEmail(email: string) {
  const u = await getUserByEmail(email);
  if (!u) redirect("/login?error=notfound");
  await setSession(u.id);
  redirect(u.role === "family" ? "/familiar" : "/inicio");
}
