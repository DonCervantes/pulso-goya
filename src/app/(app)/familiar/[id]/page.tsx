import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getIncident, getUser, listChainAnchors, listContacts, listNotifications } from "@/lib/store";
import IncidentDetail from "@/components/IncidentDetail";
import FamilyActions from "@/components/FamilyActions";

export default async function FamiliarIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "family") redirect("/");

  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) redirect("/familiar");

  // Autorización: el familiar debe estar vinculado como contacto del dueño.
  const linked = (await listContacts(incident.userId)).some((c) => c.linkedUserId === user.id);
  if (!linked) redirect("/familiar");

  const owner = await getUser(incident.userId);
  const notifications = await listNotifications(incident.id);
  const anchors = await listChainAnchors(incident.id);
  const closed = incident.status === "resolved" || incident.status === "false_alarm";

  return (
    <div className="flex flex-col gap-6">
      <IncidentDetail
        incident={incident}
        notifications={notifications}
        userName={owner?.displayName ?? "usuario"}
        anchors={anchors}
      />
      <section>
        <h2 className="mb-2 text-lg font-bold">Acciones</h2>
        <FamilyActions incidentId={incident.id} closed={closed} />
      </section>
    </div>
  );
}
