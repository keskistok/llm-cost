import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Cost Tracker — Compare API Token Pricing",
  description:
    "Compare token costs across OpenAI, Anthropic, and Google LLM APIs. Updated pricing for GPT-4.1, Claude Opus 4.6, Gemini 2.5 Pro, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
