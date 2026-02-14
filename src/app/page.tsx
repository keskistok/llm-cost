import { models, LAST_UPDATED } from "@/lib/pricing-data";
import PricingDashboard from "@/components/pricing-dashboard";

// ISR: revalidate every hour
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          LLM API Pricing Tracker
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Compare token costs across OpenAI, Anthropic, and Google models.
          <br />
          Prices per <strong>1 million tokens</strong> &mdash; last updated{" "}
          {LAST_UPDATED}.
        </p>
      </header>

      <PricingDashboard models={models} />

      <footer className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800">
        <p>
          Prices sourced from official provider pricing pages. This page
          revalidates every hour via ISR.
        </p>
      </footer>
    </div>
  );
}
