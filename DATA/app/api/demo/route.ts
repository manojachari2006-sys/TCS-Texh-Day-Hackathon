import { db } from "@/lib/db";
import { getDemoProducts, stylePresets } from "@/lib/demo-data";
import { apiError, ok } from "@/lib/utils";
export async function POST(){try{
  const [products]=await Promise.all([getDemoProducts()]);
  for(const product of products)await db.product.upsert({where:{sku:product.sku},create:product,update:product});
  for(const style of stylePresets)await db.styleProfile.upsert({where:{name:style.name},create:style,update:style});
  return ok({loaded:products.length,styles:stylePresets.length});
}catch(e){return apiError(e,"DEMO_LOAD_FAILED",500)}}
