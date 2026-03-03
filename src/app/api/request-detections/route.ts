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
  return withCors(NextResponse.json(getRequestDetections(), { status: 200 }));
}

export async function POST(request: Request) {
  let detection: RequestDetection;

  try {
    detection = (await request.json()) as RequestDetection;
  } catch {
    return withCors(
      NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 }),
    );
  }

  addRequestDetection(detection);

  return withCors(NextResponse.json({ success: true, message: "Detection stored" }, { status: 200 }));
}
