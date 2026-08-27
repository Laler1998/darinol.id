import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const modelId = "openai/gpt-4o-mini";

export function getTrendRadarModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": "https://darinol.online",
      "X-Title": "Darinol.id Trend Radar",
    },
  });

  return openrouter(modelId);
}
