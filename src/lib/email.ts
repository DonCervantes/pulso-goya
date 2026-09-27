// Envío de correo. Si RESEND_API_KEY está configurada, usa Resend;
// de lo contrario cae en modo MOCK (registra en consola y "entrega" ok).
// v1 funciona sin claves; al agregar la clave, los correos se envían de verdad.

interface FamilyAlertParams {
  to: string;
  contactName: string;
  userName: string;
  incidentId: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Remitente: acepta RESEND_FROM o RESEND_FROM_EMAIL.
function resendFrom(): string {
  return (
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "Pulso <onboarding@resend.dev>"
  );
}

function alertHtml(p: FamilyAlertParams): string {
  const link = `${APP_URL}/familiar/${p.incidentId}`;
  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#b42318">Pulso — Alerta de ${p.userName}</h2>
    <p>Hola ${p.contactName},</p>
    <p><strong>${p.userName}</strong> activó el botón de ayuda de Pulso.</p>
    <p>Abre el caso para ver el estado y confirmar que lo atenderás:</p>
    <p><a href="${link}" style="background:#0d5c63;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ver el caso</a></p>
    <p style="color:#b45309;font-size:14px">Aviso a autoridades: SIMULADO (prototipo). Si es una urgencia real, llama al 911.</p>
    <hr/>
    <p style="color:#4b5563;font-size:12px">Pulso es un prototipo. No sustituye una llamada al 911.</p>
  </div>`;
}

export async function sendFamilyAlertEmail(
  p: FamilyAlertParams,
): Promise<{ id: string; mock: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = resendFrom();

  if (!apiKey) {
    console.log(`[email MOCK] Alerta → ${p.to} (incidente ${p.incidentId})`);
    return { id: "mock_" + p.incidentId, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: p.to,
      subject: `Pulso — ${p.userName} pidió ayuda`,
      html: alertHtml(p),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id, mock: false };
}

export async function sendInviteEmail(params: {
  to: string;
  userName: string;
  token: string;
}): Promise<{ id: string; mock: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = resendFrom();
  const link = `${APP_URL}/invitacion/${params.token}`;

  if (!apiKey) {
    console.log(`[email MOCK] Invitación → ${params.to}: ${link}`);
    return { id: "mock_invite", mock: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: `${params.userName} te invitó a su red de apoyo en Pulso`,
      html: `<p>${params.userName} te invitó a unirte a su red de apoyo en Pulso.</p>
             <p><a href="${link}">Aceptar invitación</a></p>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}`);
  const data = (await res.json()) as { id: string };
  return { id: data.id, mock: false };
}
