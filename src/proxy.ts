import { NextResponse, type NextRequest } from "next/server";
import { detectAICrawlerRequest } from "@/lib/detection";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("ngrok-skip-browser-warning", "true");

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.includes(".");

  if (!isApiRoute && !isStaticAsset) {
    const detection = detectAICrawlerRequest({
      userAgent: request.headers.get("user-agent") ?? "",
      referrer: request.headers.get("referer") ?? "",
      accept: request.headers.get("accept") ?? "",
      method: request.method,
      url: request.nextUrl.pathname,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    });

    if (detection?.isLikelyAICrawler) {
      const internalUrl = new URL("/api/request-detections", request.url);

      try {
        await fetch(internalUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detection),
        });
      } catch {
        // best-effort logging only
      }
    }
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
