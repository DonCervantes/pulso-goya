import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listAmbulances } from "@/lib/store";
import { completeOnboardingAction } from "@/app/actions";
import CustomAmbulances from "@/components/CustomAmbulances";
import Logo from "@/components/Logo";

export default async function OnboardingPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");
  if (user.onboarded) redirect("/inicio");

  const ambulances = await listAmbulances();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <Logo href="/inicio" />
      <div>
        <h1 className="text-2xl font-extrabold">Cuéntanos un poco de ti</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Con esto podemos ayudarte mejor en una emergencia. Puedes editarlo después.
        </p>
      </div>

      <form action={completeOnboardingAction} className="flex flex-col gap-4">
        <Field label="Nombre completo" name="displayName" required defaultValue={user.displayName} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Edad" name="age" type="number" />
          <Field label="Alcaldía / zona" name="zone" placeholder="Ej. Cuauhtémoc" />
        </div>
        <Field label="Teléfono" name="phone" type="tel" />
        <Field label="Domicilio de atención" name="address" placeholder="Calle, número, colonia" />

        <fieldset className="rounded-xl border border-[var(--color-border-soft)] p-4">
          <legend className="px-2 text-sm font-semibold">
            Datos de salud (opcional, para emergencias)
          </legend>
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
            Información sensible. En esta versión de prueba se guarda tal cual; se cifrará en la
            versión productiva.
          </p>
          <Field label="Tipo de sangre" name="bloodType" placeholder="Ej. O+" />
          <Field label="Alergias" name="allergies" placeholder="Ej. Penicilina" />
          <Field label="Condiciones / padecimientos" name="conditions" placeholder="Ej. Diabetes, hipertensión" />
        </fieldset>

        <fieldset className="rounded-xl border border-[var(--color-border-soft)] p-4">
          <legend className="px-2 text-sm font-semibold">Ambulancias preferidas</legend>
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
            Aparecerán como botones de llamada durante una emergencia.
          </p>
          <div className="flex flex-col gap-2">
            {ambulances.map((a) => (
              <label key={a.id} className="flex items-center gap-3">
                <input type="checkbox" name="ambulances" value={a.id} className="h-5 w-5" />
                <span>
                  {a.name} <span className="text-[var(--color-text-secondary)]">· {a.phone}</span>
                </span>
              </label>
            ))}
          </div>
          <CustomAmbulances />
        </fieldset>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" required className="mt-1 h-5 w-5" />
          <span>
            Acepto el aviso de privacidad y que Pulso es un prototipo que no sustituye al 911.
          </span>
        </label>

        <button className="rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white">
          Guardar y continuar
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-lg border border-[var(--color-border)] p-3"
      />
    </label>
  );
}
