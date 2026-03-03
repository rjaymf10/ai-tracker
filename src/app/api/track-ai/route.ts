import { NextResponse } from "next/server";
import { addTrackingReport, sendAlert, type TrackingReport } from "@/lib/tracking";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("ngrok-skip-browser-warning", "true");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: Request) {
  let report: TrackingReport;

  try {
    report = (await request.json()) as TrackingReport;
  } catch {
    return withCors(
      NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 }),
    );
  }

  addTrackingReport(report);
  sendAlert(report);

  return withCors(
    NextResponse.json({ success: true, message: "Tracking data received" }, { status: 200 }),
  );
}
