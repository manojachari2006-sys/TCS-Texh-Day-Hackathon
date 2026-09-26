import { z } from "zod";

const stringList = z.array(z.string().trim().min(1)).default([]);
export const productSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  brand: z.string().trim().default(""),
  category: z.string().trim().min(1),
  subcategory: z.string().trim().default(""),
  features: stringList, specifications: stringList,
  price: z.coerce.number().finite().nonnegative(),
  currency: z.string().trim().default("INR"),
  targetAudience: z.string().trim().default(""), benefits: stringList,
  materials: stringList, color: z.string().trim().default(""),
  size: z.string().trim().default(""), availability: z.string().trim().default("In Stock"),
  imageUrl: z.string().trim().refine(value=>!value||(/^https?:\/\//i.test(value)&&URL.canParse(value)),"Image URL must be a valid HTTP or HTTPS URL").default(""), seoKeywords: stringList,
});
export const productImportSchema = z.array(productSchema).min(1).max(5000);
export const styleProfileSchema = z.object({
  name: z.string().trim().min(1), brandName: z.string().default(""), tone: z.string().default("Friendly"),
  writingStyle: z.string().default(""), targetAudience: z.string().default(""),
  preferredVocabulary: stringList, avoidedVocabulary: stringList, descriptionLength: z.string().default("Standard"),
  sentenceStyle: z.string().default("Clear and concise"), ctaStyle: z.string().default("Helpful"),
  brandGuidelines: z.string().default(""), isActive: z.boolean().default(false),
});
export const generateSchema = z.object({ productIds: z.array(z.string()).min(1).max(500), styleProfileId: z.string().optional(), keywords: stringList.optional() });
export type ProductInput = z.infer<typeof productSchema>;
