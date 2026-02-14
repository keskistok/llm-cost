export type Provider = "OpenAI" | "Anthropic" | "Google";

export interface Model {
  id: string;
  name: string;
  provider: Provider;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  contextWindow: string;
  category: "flagship" | "mid" | "fast";
}

// Prices per 1M tokens — last updated Feb 2026
export const models: Model[] = [
  // OpenAI
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    provider: "OpenAI",
    inputPrice: 1.75,
    outputPrice: 14.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "OpenAI",
    inputPrice: 1.25,
    outputPrice: 10.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    inputPrice: 1.25,
    outputPrice: 10.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    inputPrice: 0.25,
    outputPrice: 2.0,
    contextWindow: "1M",
    category: "mid",
  },
  {
    id: "gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "OpenAI",
    inputPrice: 0.05,
    outputPrice: 0.4,
    contextWindow: "1M",
    category: "fast",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    inputPrice: 2.0,
    outputPrice: 8.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    inputPrice: 0.4,
    outputPrice: 1.6,
    contextWindow: "1M",
    category: "mid",
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "OpenAI",
    inputPrice: 0.1,
    outputPrice: 0.4,
    contextWindow: "1M",
    category: "fast",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    inputPrice: 2.5,
    outputPrice: 10.0,
    contextWindow: "128K",
    category: "flagship",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: "128K",
    category: "fast",
  },
  {
    id: "o3-pro",
    name: "o3 Pro",
    provider: "OpenAI",
    inputPrice: 20.0,
    outputPrice: 80.0,
    contextWindow: "200K",
    category: "flagship",
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    inputPrice: 2.0,
    outputPrice: 8.0,
    contextWindow: "200K",
    category: "flagship",
  },
  {
    id: "o3-mini",
    name: "o3 Mini",
    provider: "OpenAI",
    inputPrice: 1.1,
    outputPrice: 4.4,
    contextWindow: "200K",
    category: "mid",
  },

  // Anthropic
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: "200K",
    category: "flagship",
  },
  {
    id: "claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: "200K",
    category: "flagship",
  },
  {
    id: "claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: "200K",
    category: "mid",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: "200K",
    category: "mid",
  },
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    inputPrice: 1.0,
    outputPrice: 5.0,
    contextWindow: "200K",
    category: "fast",
  },
  {
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    inputPrice: 0.8,
    outputPrice: 4.0,
    contextWindow: "200K",
    category: "fast",
  },

  // Google
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    inputPrice: 2.0,
    outputPrice: 12.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    inputPrice: 0.5,
    outputPrice: 3.0,
    contextWindow: "1M",
    category: "mid",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    inputPrice: 1.25,
    outputPrice: 10.0,
    contextWindow: "1M",
    category: "flagship",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    inputPrice: 0.3,
    outputPrice: 2.5,
    contextWindow: "1M",
    category: "mid",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "Google",
    inputPrice: 0.1,
    outputPrice: 0.4,
    contextWindow: "1M",
    category: "fast",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    inputPrice: 0.1,
    outputPrice: 0.4,
    contextWindow: "1M",
    category: "fast",
  },
];

export const providers: Provider[] = ["OpenAI", "Anthropic", "Google"];

export const providerColors: Record<Provider, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97706",
  Google: "#4285f4",
};

export const LAST_UPDATED = "February 2026";
