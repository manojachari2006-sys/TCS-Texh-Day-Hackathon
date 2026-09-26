import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { apiError, ok } from "@/lib/utils";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const url=new URL(request.url), page=Math.max(1,Number(url.searchParams.get("page")||1)), pageSize=Math.min(100,Math.max(1,Number(url.searchParams.get("pageSize")||25))), q=url.searchParams.get("q")||"", category=url.searchParams.get("category")||"";
    const where={...(q?{OR:[{name:{contains:q,mode:"insensitive" as const}},{sku:{contains:q,mode:"insensitive" as const}},{brand:{contains:q,mode:"insensitive" as const}}]}:{}),...(category?{category}:{})};
    const [items,total]=await Promise.all([db.product.findMany({where,include:{descriptions:{orderBy:{createdAt:"desc"},take:1}},orderBy:{updatedAt:"desc"},skip:(page-1)*pageSize,take:pageSize}),db.product.count({where})]);
    return ok({items,total,page,pageSize});
  } catch(e){return apiError(e)}
}
export async function POST(request: Request) {
  try { const data=productSchema.parse(await request.json()); const product=await db.product.create({data}); return ok(product,201); }
  catch(e){return apiError(e,e instanceof z.ZodError?"VALIDATION_ERROR":"PRODUCT_CREATE_FAILED",e instanceof z.ZodError?400:400)}
}
