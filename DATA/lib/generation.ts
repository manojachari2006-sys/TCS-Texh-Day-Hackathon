import { db } from "./db";
import { getAIProvider } from "./ai/provider";
import { scoreDescription } from "./scoring";
import { PROMPT_VERSION } from "./ai/prompt-builder";

type BatchProgress={total:number;processed:number;successful:number;failed:number;pending:number;currentProduct:string;state:"Processing"|"Succeeded"|"Failed"};
export async function runBatch(input: { productIds: string[]; styleProfileId?: string; keywords?: string[]; name?: string },onProgress?:(progress:BatchProgress)=>void) {
  const products = await db.product.findMany({ where:{id:{in:input.productIds}} });
  if (!products.length) throw new Error("No matching products found");
  const style = input.styleProfileId ? await db.styleProfile.findUnique({where:{id:input.styleProfileId}}) : await db.styleProfile.findFirst({where:{isActive:true}});
  const provider = getAIProvider();
  const batch = await db.generationBatch.create({data:{name:input.name || `Catalog batch · ${new Date().toLocaleString()}`,status:"Processing",totalProducts:products.length,startedAt:new Date(),styleProfileId:style?.id,jobs:{create:products.map(p=>({productId:p.id,status:"Pending"}))}}});
  const jobs = await db.generationJob.findMany({where:{batchId:batch.id},orderBy:{createdAt:"asc"}});
  const requestedConcurrency=Number(process.env.GENERATION_CONCURRENCY||3);
  const concurrency=Math.max(1,Math.min(10,Number.isFinite(requestedConcurrency)?Math.floor(requestedConcurrency):3));
  let cursor=0, completed=0, failed=0;
  let processed=0;
  const worker = async () => {
    while (true) {
      const index=cursor++; if(index>=products.length) return;
      const product=products[index], job=jobs.find(j=>j.productId===product.id)!;
      await db.generationJob.update({where:{id:job.id},data:{status:"Processing",startedAt:new Date()}});
      onProgress?.({total:products.length,processed,successful:completed,failed,pending:products.length-processed,currentProduct:product.name,state:"Processing"});
      let productState:"Succeeded"|"Failed"="Succeeded";
      try {
        const context={tone:style?.tone || "Friendly",brandName:style?.brandName,descriptionLength:style?.descriptionLength,preferredVocabulary:style?.preferredVocabulary,avoidedVocabulary:style?.avoidedVocabulary,targetAudience:style?.targetAudience || product.targetAudience,ctaStyle:style?.ctaStyle,keywords:input.keywords};
        const output=await provider.generate(product,context);
        const scores=scoreDescription(product,output,context.tone);
        await db.generatedDescription.create({data:{productId:product.id,styleProfileId:style?.id,title:output.title,shortDescription:output.shortDescription,longDescription:output.longDescription,sellingPoints:output.sellingPoints,featureBenefits:output.featureBenefits,seoTitle:output.seoTitle,metaDescription:output.metaDescription,seoKeywords:output.seoKeywords,tags:output.tags,callToAction:output.callToAction,...scores,status:"PENDING_REVIEW",model:provider.model,promptVersion:PROMPT_VERSION}});
        completed++;
        await db.generationJob.update({where:{id:job.id},data:{status:"Completed",completedAt:new Date()}});
      } catch(error) {
        productState="Failed";
        failed++;
        await db.generationJob.update({where:{id:job.id},data:{status:"Failed",errorMessage:error instanceof Error?error.message:"Generation failed",completedAt:new Date()}});
      }
      processed++;
      await db.generationBatch.update({where:{id:batch.id},data:{completedProducts:completed,failedProducts:failed}});
      onProgress?.({total:products.length,processed,successful:completed,failed,pending:products.length-processed,currentProduct:product.name,state:productState});
    }
  };
  await Promise.all(Array.from({length:Math.min(concurrency,products.length)},worker));
  const status=completed===0?"Failed":failed?"Completed With Errors":"Completed";
  return db.generationBatch.update({where:{id:batch.id},data:{status,completedProducts:completed,failedProducts:failed,completedAt:new Date()}});
}
