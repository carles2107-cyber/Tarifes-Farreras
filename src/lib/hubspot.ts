import { Client } from "@hubspot/api-client";

let _client: Client | null = null;

export function getHubSpotClient(): Client {
  if (!_client) {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      throw new Error("HUBSPOT_ACCESS_TOKEN is not set in environment variables");
    }
    _client = new Client({ accessToken: token });
  }
  return _client;
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function stageColorClass(stageLabel: string): string {
  const lower = stageLabel.toLowerCase();
  if (lower.includes("won") || lower.includes("guanyat") || lower.includes("cerrad") || lower.includes("closed won"))
    return "bg-green-100 text-green-800 border-green-400";
  if (lower.includes("lost") || lower.includes("perdut") || lower.includes("perdid") || lower.includes("closed lost"))
    return "bg-red-100 text-red-800 border-red-400";
  if (lower.includes("proposal") || lower.includes("oferta") || lower.includes("proposta"))
    return "bg-purple-100 text-purple-800 border-purple-400";
  if (lower.includes("negotiat") || lower.includes("negoci"))
    return "bg-yellow-100 text-yellow-800 border-yellow-400";
  return "bg-blue-100 text-blue-800 border-blue-400";
}
