export type ProductFacts = {
  sku: string; name: string; brand: string; category: string; subcategory: string;
  features: string[]; specifications: string[]; benefits: string[]; materials: string[];
  price: number; currency: string; targetAudience: string; color: string; size: string;
  availability: string; seoKeywords: string[];
};
export type DescriptionOutput = {
  title: string; shortDescription: string; longDescription: string; sellingPoints: string[];
  featureBenefits: string[]; seoTitle: string; metaDescription: string;
  seoKeywords: string[]; tags: string[]; callToAction: string;
};
export type GenerationContext = { tone: string; brandName?: string; descriptionLength?: string; preferredVocabulary?: string[]; avoidedVocabulary?: string[]; targetAudience?: string; ctaStyle?: string; keywords?: string[] };
export interface AIProvider { readonly model: string; generate(product: ProductFacts, context: GenerationContext): Promise<DescriptionOutput>; }
