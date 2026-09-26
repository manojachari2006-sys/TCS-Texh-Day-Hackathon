import { db } from "@/lib/db";
import { apiError, ok } from "@/lib/utils";
export async function GET(){try{
  const [totalProducts,descriptions,approved,batches,productsByCategory]=await Promise.all([
    db.product.count(),db.generatedDescription.findMany({select:{qualityScore:true,relevanceScore:true,creativityScore:true,seoScore:true,status:true,createdAt:true}}),db.generatedDescription.count({where:{status:"APPROVED"}}),db.generationBatch.findMany({orderBy:{createdAt:"desc"},take:10}),db.product.groupBy({by:["category"],_count:{_all:true}})
  ]);
  const avg=(key:"qualityScore"|"relevanceScore"|"creativityScore"|"seoScore")=>descriptions.length?Math.round(descriptions.reduce((s,d)=>s+d[key],0)/descriptions.length):0;
  const days=Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(6-i));const key=date.toISOString().slice(0,10);return {date:key,label:date.toLocaleDateString("en",{weekday:"short"}),count:descriptions.filter(d=>d.createdAt.toISOString().slice(0,10)===key).length}});
  return ok({totalProducts,generatedDescriptions:descriptions.length,approvedDescriptions:approved,pendingReviews:descriptions.filter(d=>d.status==="PENDING_REVIEW").length,averageQuality:avg("qualityScore"),averageRelevance:avg("relevanceScore"),averageCreativity:avg("creativityScore"),averageSeo:avg("seoScore"),failureRate:batches.reduce((a,b)=>a+b.failedProducts,0)/Math.max(1,batches.reduce((a,b)=>a+b.totalProducts,0))*100,activity:days,categories:productsByCategory.map(x=>({name:x.category,count:x._count._all})),batches});
}catch(e){return apiError(e)}}
