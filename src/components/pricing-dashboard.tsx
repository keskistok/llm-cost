"use client";

import { useState } from "react";
import { Model, Provider } from "@/lib/pricing-data";
import Filters from "./filters";
import PricingTable from "./pricing-table";

export default function PricingDashboard({ models }: { models: Model[] }) {
  const [activeProvider, setActiveProvider] = useState<Provider | "All">("All");
  const [activeCategory, setActiveCategory] = useState<
    Model["category"] | "all"
  >("all");

  return (
    <div className="flex flex-col gap-6">
      <Filters
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <PricingTable
        models={models}
        activeProvider={activeProvider}
        activeCategory={activeCategory}
      />
    </div>
  );
}
