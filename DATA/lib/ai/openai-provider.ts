import OpenAI from "openai";
import { z } from "zod";
import { buildPrompt } from "./prompt-builder";
import type { AIProvider, DescriptionOutput, GenerationContext, ProductFacts } from "./types";

const outputSchema = z.object({ title:z.string(), shortDescription:z.string(), longDescription:z.string(), sellingPoints:z.array(z.string()), featureBenefits:z.array(z.string()), seoTitle:z.string(), metaDescription:z.string(), seoKeywords:z.array(z.string()), tags:z.array(z.string()), callToAction:z.string() });
export class OpenAIProvider implements AIProvider {
  readonly model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout:30000, maxRetries:1 });
  async generate(product: ProductFacts, context: GenerationContext): Promise<DescriptionOutput> {
    const prompt = buildPrompt(product, context);
    let response = await this.client.chat.completions.create({ model:this.model, response_format:{type:"json_object"}, messages:[{role:"system",content:prompt.system},{role:"user",content:prompt.user}] });
    for (let attempt = 0; attempt < 2; attempt++) {
      try { return outputSchema.parse(JSON.parse(response.choices[0]?.message.content ?? "")); }
      catch (error) {
        if (attempt === 1) throw new Error(`AI returned invalid structured content: ${error instanceof Error ? error.message : "invalid output"}`);
        response = await this.client.chat.completions.create({ model:this.model, response_format:{type:"json_object"}, messages:[{role:"system",content:prompt.system},{role:"user",content:`${prompt.user}\nRepair the prior output into the required valid JSON only: ${response.choices[0]?.message.content ?? ""}`}] });
      }
    }
    throw new Error("AI output could not be validated");
  }
}
