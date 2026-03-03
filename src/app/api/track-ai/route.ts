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
  console.log('[track-ai] POST request received');
  let report: TrackingReport;

  try {
    report = (await request.json()) as TrackingReport;
    console.log('[track-ai] Report data:', report);
  } catch (error) {
    console.error('[track-ai] Failed to parse request JSON:', error);
    return withCors(
      NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 }),
    );
  }

  console.log('[track-ai] Processing tracking report');
  addTrackingReport(report);
  sendAlert(report);

  console.log('[track-ai] Response sent successfully');
  return withCors(
    NextResponse.json({ success: true, message: "Tracking data received" }, { status: 200 }),
  );
}
