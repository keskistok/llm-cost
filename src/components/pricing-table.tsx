import { Model, Provider, providerColors } from "@/lib/pricing-data";

function formatPrice(price: number): string {
  if (price < 1) return `$${price.toFixed(2)}`;
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

export default function PricingTable({
  models,
  activeProvider,
  activeCategory,
}: {
  models: Model[];
  activeProvider: Provider | "All";
  activeCategory: Model["category"] | "all";
}) {
  const filtered = models.filter((m) => {
    if (activeProvider !== "All" && m.provider !== activeProvider) return false;
    if (activeCategory !== "all" && m.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <th className="px-4 py-3 font-semibold">Model</th>
            <th className="px-4 py-3 font-semibold">Provider</th>
            <th className="px-4 py-3 font-semibold">Tier</th>
            <th className="px-4 py-3 text-right font-semibold">
              Input{" "}
              <span className="text-xs font-normal text-zinc-500">
                /1M tokens
              </span>
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              Output{" "}
              <span className="text-xs font-normal text-zinc-500">
                /1M tokens
              </span>
            </th>
            <th className="px-4 py-3 text-right font-semibold">Context</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((model) => (
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
          {filtered.length === 0 && (
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
