import type { AIProvider, DescriptionOutput, GenerationContext, ProductFacts } from "./types";

export class MockAIProvider implements AIProvider {
  readonly model = "mock-v1";
  async generate(p: ProductFacts, c: GenerationContext): Promise<DescriptionOutput> {
    const tone = c.tone || "Friendly";
    const allFeatures = p.features.length ? p.features : ["Thoughtfully designed for everyday use"];
    const features = c.descriptionLength === "Short" ? allFeatures.slice(0, 2) : allFeatures;
    const benefits = p.benefits.length ? p.benefits : features.map(f => `Enjoy the convenience of ${f.toLowerCase()}`);
    const keywords = [...new Set([...(c.keywords ?? []), ...p.seoKeywords])].slice(0, 8);
    const lead = tone === "Luxury" || tone === "Premium" ? "Discover considered design with" : tone === "Energetic" ? "Bring more energy to your day with" : tone === "Professional" || tone === "Technical" ? "Meet the dependable" : "Meet your new favourite: ";
    const title = `${p.brand ? `${p.brand} ` : ""}${p.name}`;
    const keywordPhrase=keywords.length?` Explore ${keywords.slice(0,2).join(" and ")}.`:"";
    const shortDescription = `${lead} ${p.name}, made for ${p.targetAudience || "everyday life"}. ${features.slice(0, 2).join(" and ")}.${keywordPhrase}`;
    const longDescription = `${title} brings together ${features.join(", ")}. ${benefits.slice(0,features.length).join(". ")}. ${p.materials.length ? `Made with ${p.materials.join(" and ")}. ` : ""}${p.availability ? `Availability: ${p.availability}. ` : ""}A practical choice for ${p.targetAudience || "daily use"}.${keywordPhrase}`;
    return {
      title, shortDescription, longDescription,
      sellingPoints: features.slice(0, 5),
      featureBenefits: features.slice(0, 5).map((feature, i) => `${feature} — ${benefits[i] ?? "designed to make everyday use simpler"}`),
      seoTitle: title.slice(0, 65), metaDescription: shortDescription.slice(0, 155),
      seoKeywords: keywords, tags: [p.category, p.subcategory, tone].filter(Boolean),
      callToAction: c.ctaStyle === "Direct" ? "Add it to your cart today." : `Explore ${p.name} and find the right fit for you.`,
    };
  }
}
