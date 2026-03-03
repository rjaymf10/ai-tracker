import { NextResponse } from "next/server";
import {
  addRequestDetection,
  getRequestDetections,
} from "@/lib/tracking";
import type { RequestDetection } from "@/lib/detection";

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

export async function GET() {
  console.log('[request-detections] GET request received');
  const detections = getRequestDetections();
  console.log('[request-detections] Returning', detections.total, 'detection(s)');
  return withCors(NextResponse.json(detections, { status: 200 }));
}

export async function POST(request: Request) {
  console.log('[request-detections] POST request received');
  let detection: RequestDetection;

  try {
    detection = (await request.json()) as RequestDetection;
    console.log('[request-detections] Detection data:', detection);
  } catch (error) {
    console.error('[request-detections] Failed to parse request JSON:', error);
    return withCors(
      NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 }),
    );
  }

  console.log('[request-detections] Storing detection');
  addRequestDetection(detection);

  console.log('[request-detections] Response sent successfully');
  return withCors(NextResponse.json({ success: true, message: "Detection stored" }, { status: 200 }));
}
