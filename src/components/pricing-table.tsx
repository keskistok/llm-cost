"use client";

import { useState } from "react";
import { Model, Provider, providerColors } from "@/lib/pricing-data";

type SortKey =
  | "name"
  | "provider"
  | "category"
  | "inputPrice"
  | "outputPrice"
  | "contextWindow";
type SortDir = "asc" | "desc";

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: providerColors[provider] }}
    >
      {provider}
    </span>
  );
}

function CategoryLabel({ category }: { category: Model["category"] }) {
  const styles: Record<Model["category"], string> = {
    flagship:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    mid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    fast: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  const labels: Record<Model["category"], string> = {
    flagship: "Flagship",
    mid: "Mid-tier",
    fast: "Fast / Lite",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[category]}`}
    >
      {labels[category]}
    </span>
  );
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDir;
}) {
  if (!active) {
    return (
      <svg
        className="ml-1 inline-block h-3 w-3 text-zinc-300 dark:text-zinc-600"
        viewBox="0 0 10 14"
        fill="currentColor"
      >
        <path d="M5 0L9 5H1L5 0Z" />
        <path d="M5 14L1 9H9L5 14Z" />
      </svg>
    );
  }

  return (
    <svg
      className="ml-1 inline-block h-3 w-3 text-zinc-900 dark:text-zinc-100"
      viewBox="0 0 10 8"
      fill="currentColor"
    >
      {direction === "asc" ? (
        <path d="M5 0L10 8H0L5 0Z" />
      ) : (
        <path d="M5 8L0 0H10L5 8Z" />
      )}
    </svg>
  );
}

function parseContext(ctx: string): number {
  const match = ctx.match(/([\d.]+)\s*(M|K)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  return match[2].toUpperCase() === "M" ? val * 1000 : val;
}

const categoryOrder: Record<string, number> = {
  flagship: 0,
  mid: 1,
  fast: 2,
};

export default function PricingTable({
  models,
  activeProvider,
  activeCategory,
}: {
  models: Model[];
  activeProvider: Provider | "All";
  activeCategory: Model["category"] | "all";
}) {
  const [sortKey, setSortKey] = useState<SortKey>("inputPrice");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Default to ascending for text columns, descending for numeric
      setSortDir(
        key === "name" || key === "provider" || key === "category"
          ? "asc"
          : "desc"
      );
    }
  }

  const filtered = models.filter((m) => {
    if (activeProvider !== "All" && m.provider !== activeProvider) return false;
    if (activeCategory !== "all" && m.category !== activeCategory) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "provider":
        cmp = a.provider.localeCompare(b.provider);
        break;
      case "category":
        cmp =
          (categoryOrder[a.category] ?? 0) - (categoryOrder[b.category] ?? 0);
        break;
      case "inputPrice":
        cmp = a.inputPrice - b.inputPrice;
        break;
      case "outputPrice":
        cmp = a.outputPrice - b.outputPrice;
        break;
      case "contextWindow":
        cmp = parseContext(a.contextWindow) - parseContext(b.contextWindow);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const headers: {
    key: SortKey;
    label: string;
    suffix?: string;
    align?: string;
  }[] = [
    { key: "name", label: "Model" },
    { key: "provider", label: "Provider" },
    { key: "category", label: "Tier" },
    {
      key: "inputPrice",
      label: "Input",
      suffix: "/1M tokens",
      align: "text-right",
    },
    {
      key: "outputPrice",
      label: "Output",
      suffix: "/1M tokens",
      align: "text-right",
    },
    { key: "contextWindow", label: "Context", align: "text-right" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className={`cursor-pointer select-none px-4 py-3 font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${h.align ?? ""}`}
              >
                {h.label}
                {h.suffix && (
                  <span className="text-xs font-normal text-zinc-500">
                    {" "}
                    {h.suffix}
                  </span>
                )}
                <SortIndicator
                  active={sortKey === h.key}
                  direction={sortDir}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((model) => (
            <tr
              key={model.id}
              className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
            >
              <td className="px-4 py-3 font-medium">{model.name}</td>
              <td className="px-4 py-3">
                <ProviderBadge provider={model.provider} />
              </td>
              <td className="px-4 py-3">
                <CategoryLabel category={model.category} />
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatPrice(model.inputPrice)}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatPrice(model.outputPrice)}
              </td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                {model.contextWindow}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-zinc-500"
              >
                No models match the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
