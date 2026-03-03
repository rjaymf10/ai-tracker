export type RequestDetection = {
  isLikelyAICrawler: boolean;
  confidence: number;
  reasons: string[];
  method: string;
  url: string;
  userAgent: string;
  referrer: string;
  ip: string;
  timestamp: string;
};

export function detectAICrawlerRequest(input: {
  userAgent?: string;
  referrer?: string;
  accept?: string;
  method: string;
  url: string;
  ip: string;
}): RequestDetection | null {
  const userAgent = input.userAgent ?? "";
  const referrer = input.referrer ?? "";
  const accept = input.accept ?? "";
  const method = input.method;
  const url = input.url;

  const reasons: string[] = [];
  let score = 0;

  const uaPatterns = [
    { pattern: /GPTBot/i, reason: "User-Agent matches GPTBot", score: 95 },
    { pattern: /ChatGPT-User/i, reason: "User-Agent matches ChatGPT-User", score: 95 },
    { pattern: /ClaudeBot/i, reason: "User-Agent matches ClaudeBot", score: 95 },
    { pattern: /anthropic-ai/i, reason: "User-Agent references Anthropic", score: 90 },
    { pattern: /Google-Extended/i, reason: "User-Agent matches Google-Extended", score: 95 },
    { pattern: /GoogleOther/i, reason: "User-Agent matches GoogleOther", score: 85 },
    {
      pattern: /Bytespider|PerplexityBot|CCBot|Applebot|Bingbot|DuckDuckBot|YandexBot/i,
      reason: "User-Agent matches known crawler",
      score: 80,
    },
    {
      pattern: /bot|crawler|spider|scraper/i,
      reason: "User-Agent has generic crawler keyword",
      score: 60,
    },
  ];

  for (const entry of uaPatterns) {
    if (entry.pattern.test(userAgent)) {
      reasons.push(entry.reason);
      score = Math.max(score, entry.score);
    }
  }

  if (/chatgpt\.com|chat\.openai\.com|gemini\.google\.com|bard\.google\.com/i.test(referrer)) {
    reasons.push("Referrer indicates AI assistant source");
    score = Math.max(score, 55);
  }

  if (/text\/html/i.test(accept) && (method === "GET" || method === "HEAD")) {
    reasons.push("HTML fetch request observed");
    score = Math.max(score, 25);
  }

  if (score === 0) {
    return null;
  }

  return {
    isLikelyAICrawler: score >= 50,
    confidence: Math.min(score, 100),
    reasons,
    method,
    url,
    userAgent,
    referrer,
    ip: input.ip,
    timestamp: new Date().toISOString(),
  };
}
