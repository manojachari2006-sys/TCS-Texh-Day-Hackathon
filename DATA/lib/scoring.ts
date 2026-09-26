import type { DescriptionOutput } from "./ai/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export function scoreDescription(product: { name: string; features: string[]; seoKeywords: string[] }, d: DescriptionOutput, styleTone = "") {
  const text = `${d.title} ${d.shortDescription} ${d.longDescription} ${d.seoTitle} ${d.metaDescription}`.toLowerCase();
  const keywords = product.seoKeywords.filter(Boolean);
  const present = keywords.filter(k => text.includes(k.toLowerCase())).length;
  const relevance = clamp(45 + (text.includes(product.name.toLowerCase()) ? 25 : 0) + Math.min(product.features.length, 5) * 6);
  const sentences=d.longDescription.split(/[.!?]+/).filter(Boolean);
  const avgSentenceWords=sentences.length?sentences.reduce((n,s)=>n+s.trim().split(/\s+/).length,0)/sentences.length:0;
  const naturalness=keywords.length?present/keywords.length:0.65;
  const stuffingPenalty=Math.max(0,(d.seoKeywords.length+1)-new Set(d.seoKeywords.map(k=>k.toLowerCase())).size)*8+Math.max(0,present-4)*5;
  const readability=avgSentenceWords>0&&avgSentenceWords<=25?10:avgSentenceWords<=32?5:0;
  const seo = clamp(25 + (keywords.length ? (present / keywords.length) * 30 : 15) + naturalness*15 + (d.seoTitle.length >= 25 && d.seoTitle.length <= 65 ? 10 : 0) + (d.metaDescription.length >= 70 && d.metaDescription.length <= 160 ? 10 : 0) + readability - stuffingPenalty);
  const completeness = clamp(Object.values(d).filter(v => Array.isArray(v) ? v.length > 0 : String(v).trim().length > 0).length / 10 * 100);
  const consistency = clamp(styleTone && text.includes(styleTone.toLowerCase()) ? 90 : 80);
  const creativity = clamp(65 + new Set(text.split(/\W+/).filter(Boolean)).size / Math.max(1, text.split(/\W+/).length) * 30);
  const quality = clamp(relevance * .25 + seo * .2 + completeness * .2 + consistency * .2 + creativity * .15);
  return { qualityScore: quality, relevanceScore: relevance, creativityScore: creativity, seoScore: seo, completenessScore: completeness, consistencyScore: consistency };
}
