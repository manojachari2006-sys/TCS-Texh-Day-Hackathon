import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const mode = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if(!["auto","openai","mock"].includes(mode))throw new Error("AI_PROVIDER must be auto, openai, or mock");
  if (mode === "mock") return new MockAIProvider();
  if (mode === "openai") {
    if (!process.env.OPENAI_API_KEY) throw new Error("AI_PROVIDER=openai requires OPENAI_API_KEY");
    return new OpenAIProvider();
  }
  if (mode === "auto" && process.env.OPENAI_API_KEY) return new OpenAIProvider();
  return new MockAIProvider();
}
