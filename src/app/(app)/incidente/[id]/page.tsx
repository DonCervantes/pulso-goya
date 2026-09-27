import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getIncident, getUser, listChainAnchors, listNotifications } from "@/lib/store";
import IncidentDetail from "@/components/IncidentDetail";

export default async function IncidentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident || incident.userId !== user.id) redirect("/inicio");

  const owner = await getUser(incident.userId);
  const notifications = await listNotifications(incident.id);
  const anchors = await listChainAnchors(incident.id);

  return (
    <IncidentDetail
      incident={incident}
      notifications={notifications}
      userName={owner?.displayName ?? "usuario"}
      anchors={anchors}
    />
  );
}
