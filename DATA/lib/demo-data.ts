import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseCsv } from "./csv";

export async function getDemoProducts() {
  const text=await readFile(join(process.cwd(),"data","products.csv"),"utf8");
  const rows=parseCsv(text), headers=rows.shift()||[];
  return rows.map(row=>{const raw=Object.fromEntries(headers.map((h,i)=>[h,row[i]||""]));return {
    sku:raw.id, name:raw.name, brand:"Demo Collection", category:raw.category, subcategory:"",
    features:raw.features.split(";").map((x:string)=>x.trim()).filter(Boolean),
    specifications:raw.specifications.split(";").map((x:string)=>x.trim()).filter(Boolean),
    price:Number(raw.price.replace(/[^0-9.]/g,""))||0,currency:"INR",targetAudience:"Modern Indian shoppers",
    benefits:raw.features.split(";").map((x:string)=>`Enjoy ${x.trim().toLowerCase()}`).filter(Boolean),materials:[],color:"",size:"",availability:"In Stock",imageUrl:"",
    seoKeywords:raw.keywords.split(";").map((x:string)=>x.trim()).filter(Boolean),
  }});
}

export const stylePresets = [
  {name:"Professional",tone:"Professional",writingStyle:"Clear, credible and concise",descriptionLength:"Standard",sentenceStyle:"Direct and informative",ctaStyle:"Helpful"},
  {name:"Friendly",tone:"Friendly",writingStyle:"Warm, conversational and welcoming",descriptionLength:"Standard",sentenceStyle:"Easy to read",ctaStyle:"Helpful"},
  {name:"Premium",tone:"Luxury",writingStyle:"Refined, polished and considered",descriptionLength:"Detailed",sentenceStyle:"Elegant and measured",ctaStyle:"Subtle"},
  {name:"Minimal",tone:"Minimal",writingStyle:"Minimal and factual",descriptionLength:"Short",sentenceStyle:"Short sentences",ctaStyle:"Direct"},
  {name:"Energetic",tone:"Energetic",writingStyle:"Upbeat and vivid",descriptionLength:"Standard",sentenceStyle:"Active voice",ctaStyle:"Direct"},
  {name:"Technical",tone:"Technical",writingStyle:"Precise and specification-led",descriptionLength:"Detailed",sentenceStyle:"Structured and clear",ctaStyle:"Helpful"},
  {name:"Luxury",tone:"Luxury",writingStyle:"Exclusive, sensory and polished",descriptionLength:"Detailed",sentenceStyle:"Elegant and measured",ctaStyle:"Subtle"},
  {name:"Youthful",tone:"Energetic",writingStyle:"Fresh and contemporary",descriptionLength:"Short",sentenceStyle:"Lively and clear",ctaStyle:"Direct"},
].map((x,i)=>({...x,brandName:"RetailAI Demo",targetAudience:"Retail customers",preferredVocabulary:[],avoidedVocabulary:[],brandGuidelines:"Stay factual and customer focused.",isActive:i===1}));
