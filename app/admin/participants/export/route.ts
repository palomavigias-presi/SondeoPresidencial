import { NextResponse } from "next/server";
import { exportParticipantsCsvAction } from "../actions";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sourceParam = url.searchParams.get("source");
  const source: "real" | "simulated" | "all" =
    sourceParam === "simulated" || sourceParam === "all"
      ? sourceParam
      : "real";
  const filters = {
    department: url.searchParams.get("department") || undefined,
    region: url.searchParams.get("region") || undefined,
    consentWhatsApp:
      url.searchParams.get("consent_whatsapp") === "true" ? true : undefined,
    source,
  };
  const { csv, filename } = await exportParticipantsCsvAction(filters);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
