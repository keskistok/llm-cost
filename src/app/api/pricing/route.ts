import { NextResponse } from "next/server";
import { scrapeAllPricing } from "@/lib/scraper";
import { models as staticModels } from "@/lib/pricing-data";

export const revalidate = 3600; // ISR: cache for 1 hour

export async function GET() {
  const result = await scrapeAllPricing();

  const hasScrapedData = result.models.length > 0;

  return NextResponse.json({
    models: hasScrapedData ? result.models : staticModels,
    sources: result.sources,
    scrapedAt: result.scrapedAt,
    usingFallback: !hasScrapedData,
  });
}
