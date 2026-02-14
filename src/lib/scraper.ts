import { Model, Provider } from "./pricing-data";

export const PRICING_URLS: Record<Provider, string> = {
  OpenAI: "https://developers.openai.com/api/docs/pricing",
  Anthropic: "https://platform.claude.com/docs/en/about-claude/pricing",
  Google: "https://ai.google.dev/gemini-api/docs/pricing",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categorizeModel(name: string, provider: Provider): Model["category"] {
  const lower = name.toLowerCase();

  if (provider === "OpenAI") {
    if (lower.includes("nano")) return "fast";
    if (lower.includes("mini")) return "mid";
    return "flagship";
  }
  if (provider === "Anthropic") {
    if (lower.includes("haiku")) return "fast";
    if (lower.includes("sonnet")) return "mid";
    return "flagship";
  }
  if (provider === "Google") {
    if (lower.includes("flash-lite") || lower.includes("flash lite"))
      return "fast";
    if (lower.includes("flash")) return "mid";
    return "flagship";
  }
  return "flagship";
}

async function fetchPage(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LLMCostTracker/1.0; +https://llm-cost.dev)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 }, // Next.js fetch cache: 1 hour
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// OpenAI parser
// ---------------------------------------------------------------------------

interface KnownModel {
  id: string;
  displayName: string;
  context: string;
}

const OPENAI_MODELS: KnownModel[] = [
  { id: "gpt-5.2", displayName: "GPT-5.2", context: "1M" },
  { id: "gpt-5.1", displayName: "GPT-5.1", context: "1M" },
  { id: "gpt-5", displayName: "GPT-5", context: "1M" },
  { id: "gpt-5-mini", displayName: "GPT-5 Mini", context: "1M" },
  { id: "gpt-5-nano", displayName: "GPT-5 Nano", context: "1M" },
  { id: "gpt-4.1", displayName: "GPT-4.1", context: "1M" },
  { id: "gpt-4.1-mini", displayName: "GPT-4.1 Mini", context: "1M" },
  { id: "gpt-4.1-nano", displayName: "GPT-4.1 Nano", context: "1M" },
  { id: "gpt-4o", displayName: "GPT-4o", context: "128K" },
  { id: "gpt-4o-mini", displayName: "GPT-4o Mini", context: "128K" },
  { id: "o3-pro", displayName: "o3 Pro", context: "200K" },
  { id: "o3", displayName: "o3", context: "200K" },
  { id: "o3-mini", displayName: "o3 Mini", context: "200K" },
];

function parseOpenAI(html: string): Model[] {
  const text = stripHtml(html);
  const models: Model[] = [];

  for (const km of OPENAI_MODELS) {
    // Escape dots in model IDs for regex
    const escaped = km.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Find the model name in text
    const modelRegex = new RegExp(escaped, "i");
    const modelMatch = text.match(modelRegex);
    if (!modelMatch || modelMatch.index === undefined) continue;

    // Grab a large window after the model name to reach the Standard tier
    const afterModel = text.substring(
      modelMatch.index,
      modelMatch.index + 1200
    );

    // OpenAI shows multiple tiers (Batch, Flex, Standard, Priority).
    // We want Standard tier pricing — the default on-demand rate.
    const standardIdx = afterModel.search(/\bstandard\b/i);
    if (standardIdx < 0) continue;

    // From "Standard", grab a window (before the next tier like "Priority")
    const afterStandard = afterModel.substring(standardIdx, standardIdx + 250);
    const priceMatches = [...afterStandard.matchAll(/\$([\d.]+)/g)];

    // Expect 3 prices: input, cached input, output — take 1st and 3rd.
    // If only 2 prices (no cached), take 1st and 2nd.
    if (priceMatches.length >= 2) {
      const inputPrice = parseFloat(priceMatches[0][1]);
      const outputPrice =
        priceMatches.length >= 3
          ? parseFloat(priceMatches[2][1])
          : parseFloat(priceMatches[1][1]);

      if (
        !isNaN(inputPrice) &&
        !isNaN(outputPrice) &&
        inputPrice > 0 &&
        outputPrice > 0
      ) {
        models.push({
          id: km.id,
          name: km.displayName,
          provider: "OpenAI",
          inputPrice,
          outputPrice,
          contextWindow: km.context,
          category: categorizeModel(km.id, "OpenAI"),
        });
      }
    }
  }

  return models;
}

// ---------------------------------------------------------------------------
// Anthropic parser
// ---------------------------------------------------------------------------

const ANTHROPIC_MODELS: KnownModel[] = [
  { id: "claude-opus-4.6", displayName: "Claude Opus 4.6", context: "200K" },
  { id: "claude-opus-4.5", displayName: "Claude Opus 4.5", context: "200K" },
  {
    id: "claude-sonnet-4.5",
    displayName: "Claude Sonnet 4.5",
    context: "200K",
  },
  { id: "claude-sonnet-4", displayName: "Claude Sonnet 4", context: "200K" },
  { id: "claude-haiku-4.5", displayName: "Claude Haiku 4.5", context: "200K" },
  { id: "claude-haiku-3.5", displayName: "Claude Haiku 3.5", context: "200K" },
];

// Mapping from display name pattern to search pattern
const ANTHROPIC_PATTERNS: Record<string, string> = {
  "claude-opus-4.6": "Claude Opus 4\\.6",
  "claude-opus-4.5": "Claude Opus 4\\.5",
  "claude-sonnet-4.5": "Claude Sonnet 4\\.5",
  "claude-sonnet-4": "Claude Sonnet 4(?!\\.)",
  "claude-haiku-4.5": "Claude Haiku 4\\.5",
  "claude-haiku-3.5": "Claude Haiku 3\\.5",
};

function parseAnthropic(html: string): Model[] {
  const text = stripHtml(html);
  const models: Model[] = [];

  for (const km of ANTHROPIC_MODELS) {
    const searchPattern = ANTHROPIC_PATTERNS[km.id];
    if (!searchPattern) continue;

    const nameRegex = new RegExp(searchPattern, "i");
    const idx = text.search(nameRegex);
    if (idx < 0) continue;

    // Limit the window to just this model's row by stopping before the
    // next "Claude" model name. Without this, the 400-char window bleeds
    // into subsequent rows and the "last" price match belongs to a
    // different model.
    const rest = text.substring(idx + 1);
    const nextModel = rest.search(/Claude\s+(Opus|Sonnet|Haiku)\s+\d/i);
    const windowEnd =
      nextModel >= 0 ? idx + 1 + nextModel : idx + 400;
    const window = text.substring(idx, windowEnd);

    // Anthropic table format: "$X / MTok" — find all such patterns.
    // The table columns are: Base Input, 5m Cache, 1h Cache, Cache Hits, Output.
    // We want the first (Base Input) and last (Output) within this row.
    const priceMatches = [
      ...window.matchAll(/\$([\d.]+)\s*\/?\s*MTok/gi),
    ];

    if (priceMatches.length >= 2) {
      const inputPrice = parseFloat(priceMatches[0][1]);
      const outputPrice = parseFloat(priceMatches[priceMatches.length - 1][1]);

      if (!isNaN(inputPrice) && !isNaN(outputPrice)) {
        models.push({
          id: km.id,
          name: km.displayName,
          provider: "Anthropic",
          inputPrice,
          outputPrice,
          contextWindow: km.context,
          category: categorizeModel(km.id, "Anthropic"),
        });
      }
    }
  }

  return models;
}

// ---------------------------------------------------------------------------
// Google parser
// ---------------------------------------------------------------------------

const GOOGLE_MODELS: KnownModel[] = [
  { id: "gemini-3-pro", displayName: "Gemini 3 Pro", context: "1M" },
  { id: "gemini-3-flash", displayName: "Gemini 3 Flash", context: "1M" },
  { id: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", context: "1M" },
  { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", context: "1M" },
  {
    id: "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash-Lite",
    context: "1M",
  },
  { id: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash", context: "1M" },
];

const GOOGLE_PATTERNS: Record<string, string> = {
  "gemini-3-pro": "Gemini 3 Pro(?! Image)",
  "gemini-3-flash": "Gemini 3 Flash(?! Preview)",
  "gemini-2.5-pro": "Gemini 2\\.5 Pro(?! Preview| Image)",
  "gemini-2.5-flash":
    "Gemini 2\\.5 Flash(?!-| Lite| Image| Preview| Native)",
  "gemini-2.5-flash-lite": "Gemini 2\\.5 Flash.?Lite",
  "gemini-2.0-flash": "Gemini 2\\.0 Flash(?!-| Lite)",
};

function parseGoogle(html: string): Model[] {
  const text = stripHtml(html);
  const models: Model[] = [];

  for (const km of GOOGLE_MODELS) {
    const searchPattern = GOOGLE_PATTERNS[km.id];
    if (!searchPattern) continue;

    const nameRegex = new RegExp(searchPattern, "i");
    const idx = text.search(nameRegex);
    if (idx < 0) continue;

    // Limit window to this model's section (stop at next Gemini model name)
    const rest = text.substring(idx + 1);
    const nextModel = rest.search(/Gemini\s+\d/i);
    const windowEnd = nextModel >= 0 ? idx + 1 + nextModel : idx + 600;
    let window = text.substring(idx, windowEnd);

    // Exclude batch pricing — only keep the standard/paid section
    const batchIdx = window.search(/\bbatch\b/i);
    if (batchIdx > 0) {
      window = window.substring(0, batchIdx);
    }

    // Google format: "$X.XX" per 1M tokens — find dollar amounts.
    // Pro models list 4 prices: input (≤200k), input (>200k),
    // output (≤200k), output (>200k). Flash models may list 3:
    // text input, audio input, output.
    // In both cases, 1st = base input, 3rd = base output.
    const priceMatches = [...window.matchAll(/\$([\d.]+)/g)];

    if (priceMatches.length >= 2) {
      const inputPrice = parseFloat(priceMatches[0][1]);
      const outputPrice =
        priceMatches.length >= 3
          ? parseFloat(priceMatches[2][1])
          : parseFloat(priceMatches[1][1]);

      if (!isNaN(inputPrice) && !isNaN(outputPrice) && inputPrice > 0) {
        models.push({
          id: km.id,
          name: km.displayName,
          provider: "Google",
          inputPrice,
          outputPrice,
          contextWindow: km.context,
          category: categorizeModel(km.id, "Google"),
        });
      }
    }
  }

  return models;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ScrapeResult {
  models: Model[];
  sources: Record<
    string,
    { url: string; success: boolean; modelCount: number; error?: string }
  >;
  scrapedAt: string;
}

const PARSERS: Record<Provider, (html: string) => Model[]> = {
  OpenAI: parseOpenAI,
  Anthropic: parseAnthropic,
  Google: parseGoogle,
};

export async function scrapeAllPricing(): Promise<ScrapeResult> {
  const sources: ScrapeResult["sources"] = {};
  const allModels: Model[] = [];

  const entries = Object.entries(PRICING_URLS) as [Provider, string][];

  // Fetch all providers concurrently
  const results = await Promise.allSettled(
    entries.map(async ([provider, url]) => {
      const html = await fetchPage(url);
      const models = PARSERS[provider](html);
      return { provider, url, models };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { provider, url, models } = result.value;
      if (models.length > 0) {
        allModels.push(...models);
        sources[provider] = { url, success: true, modelCount: models.length };
      } else {
        sources[provider] = {
          url,
          success: false,
          modelCount: 0,
          error: "No pricing data parsed from page",
        };
      }
    } else {
      // Find which provider failed — use index
      const idx = results.indexOf(result);
      const [provider, url] = entries[idx];
      sources[provider] = {
        url,
        success: false,
        modelCount: 0,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      };
    }
  }

  return {
    models: allModels,
    sources,
    scrapedAt: new Date().toISOString(),
  };
}
