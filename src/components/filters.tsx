"use client";

import { Model, Provider, providers, providerColors } from "@/lib/pricing-data";

export default function Filters({
  activeProvider,
  setActiveProvider,
  activeCategory,
  setActiveCategory,
}: {
  activeProvider: Provider | "All";
  setActiveProvider: (p: Provider | "All") => void;
  activeCategory: Model["category"] | "all";
  setActiveCategory: (c: Model["category"] | "all") => void;
}) {
  const allProviders: (Provider | "All")[] = ["All", ...providers];

  const categories: { value: Model["category"] | "all"; label: string }[] = [
    { value: "all", label: "All tiers" },
    { value: "flagship", label: "Flagship" },
    { value: "mid", label: "Mid-tier" },
    { value: "fast", label: "Fast / Lite" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex flex-wrap gap-2">
        {allProviders.map((p) => {
          const isActive = activeProvider === p;
          const color = p !== "All" ? providerColors[p] : undefined;

          return (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                isActive
                  ? "border-transparent text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: color ?? "#3f3f46",
                    }
                  : undefined
              }
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
              activeCategory === c.value
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
