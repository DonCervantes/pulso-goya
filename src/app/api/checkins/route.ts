import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listCheckins, saveCheckin } from "@/lib/store";
import type { CheckinAnswer } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    answers?: Record<string, CheckinAnswer>;
    wantsContact?: boolean;
    alarmSignal?: boolean;
  };
  const a = body.answers ?? {};
  const checkin = await saveCheckin(user.id, {
    answers: {
      S1: (a.S1 ?? null) as CheckinAnswer,
      S2: (a.S2 ?? null) as CheckinAnswer,
      S3: (a.S3 ?? null) as CheckinAnswer,
      S4: (a.S4 ?? null) as CheckinAnswer,
      S5: (a.S5 ?? null) as CheckinAnswer,
    },
    wantsContact: !!body.wantsContact,
    alarmSignal: !!body.alarmSignal,
  });
  return NextResponse.json({ checkin });
}

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ checkins: await listCheckins(user.id) });
}
