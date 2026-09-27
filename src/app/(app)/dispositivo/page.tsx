import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DevicePairing from "@/components/DevicePairing";

export default async function DispositivoPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Mi dispositivo</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Vincula tu collar Pulso y tenlo listo para pedir ayuda.
        </p>
      </div>

      <DevicePairing />
    </div>
  );
}
