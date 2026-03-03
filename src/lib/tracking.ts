import fs from "node:fs";
import path from "node:path";
import type { RequestDetection } from "@/lib/detection";

export type Behavior = {
  mouseMovements?: number;
  clicks?: number;
  scrolls?: number;
  keyPresses?: number;
  timeOnPage?: number;
};

export type TrackingReport = {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  userAgent: string;
  url?: string;
  behavior?: Behavior;
  serverTimestamp?: string;
};

const trackingData: TrackingReport[] = [];
const requestDetections: RequestDetection[] = [];

const TRACKING_LOG_FILE = path.join(process.cwd(), "tracking-log.json");
const REQUEST_LOG_FILE = path.join(process.cwd(), "request-log.json");

function readJsonArrayFile<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArrayFile<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function appendJsonItem<T>(filePath: string, item: T): void {
  const logs = readJsonArrayFile<T>(filePath);
  logs.push(item);
  writeJsonArrayFile(filePath, logs);
}

export function addTrackingReport(report: TrackingReport): TrackingReport {
  const withTimestamp: TrackingReport = {
    ...report,
    serverTimestamp: new Date().toISOString(),
  };

  trackingData.push(withTimestamp);
  appendJsonItem(TRACKING_LOG_FILE, withTimestamp);

  return withTimestamp;
}

export function getTrackingData() {
  return {
    total: trackingData.length,
    data: trackingData,
  };
}

export function addRequestDetection(detection: RequestDetection) {
  requestDetections.push(detection);
  appendJsonItem(REQUEST_LOG_FILE, detection);
}

export function getRequestDetections() {
  return {
    total: requestDetections.length,
    data: requestDetections,
  };
}

export function getTopReasons() {
  const reasonCounts: Record<string, number> = {};

  trackingData.forEach((report) => {
    if (report.isBot) {
      report.reasons.forEach((reason) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    }
  });

  return Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));
}

export function getStats() {
  const totalVisits = trackingData.length;
  const botVisits = trackingData.filter((item) => item.isBot).length;

  return {
    totalVisits,
    botVisits,
    humanVisits: totalVisits - botVisits,
    averageConfidence:
      trackingData.reduce((sum, item) => sum + item.confidence, 0) / totalVisits || 0,
    uniqueUserAgents: new Set(trackingData.map((item) => item.userAgent)).size,
    topBotPatterns: getTopReasons(),
    serverSideDetections: requestDetections.length,
  };
}

export function sendAlert(report: TrackingReport) {
  if (report.confidence <= 80) {
    return;
  }

  console.log("⚠️  ALERT: High confidence bot detected!");
  console.log("   Confidence:", `${report.confidence}%`);
  console.log("   User Agent:", report.userAgent);
  console.log("   URL:", report.url ?? "(unknown)");
}
