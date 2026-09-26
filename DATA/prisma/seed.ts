import { PrismaClient } from "@prisma/client";
import { getDemoProducts, stylePresets } from "../lib/demo-data";
const db=new PrismaClient();
async function main(){
  const products=await getDemoProducts();
  for(const product of products)await db.product.upsert({where:{sku:product.sku},create:product,update:product});
  for(const style of stylePresets)await db.styleProfile.upsert({where:{name:style.name},create:style,update:style});
  console.log(`Seeded ${products.length} products and ${stylePresets.length} style profiles.`);
}
main().catch(error=>{console.error(error);process.exit(1)}).finally(()=>db.$disconnect());
