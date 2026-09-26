import { db } from "@/lib/db";
import { csvEscape } from "@/lib/csv";
export async function GET(request:Request){
  const url=new URL(request.url),format=url.searchParams.get("format")||"csv",ids=url.searchParams.get("ids")?.split(",").filter(Boolean);
  const products=await db.product.findMany({where:ids?.length?{id:{in:ids}}:undefined,include:{descriptions:{orderBy:{createdAt:"desc"},take:1}},orderBy:{name:"asc"}});
  const records=products.map(p=>{const d=p.descriptions[0];return {SKU:p.sku,"Product Name":p.name,Category:p.category,Price:`${p.currency} ${p.price}`,"Short Description":d?.shortDescription||"","Long Description":d?.longDescription||"","Selling Points":d?.sellingPoints||[],"SEO Title":d?.seoTitle||"","Meta Description":d?.metaDescription||"","SEO Keywords":d?.seoKeywords||p.seoKeywords,Tags:d?.tags||[],"Quality Score":d?.qualityScore??"","SEO Score":d?.seoScore??"",Status:d?.status||"Not generated"}});
  if(format==="json")return new Response(JSON.stringify(records,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=retailai-catalog.json"}});
  const headers=Object.keys(records[0]||{SKU:"", "Product Name":"",Category:"",Price:"","Short Description":"","Long Description":"","Selling Points":"","SEO Title":"","Meta Description":"","SEO Keywords":"",Tags:"","Quality Score":"","SEO Score":"",Status:""});
  const body=[headers.map(csvEscape).join(","),...records.map(r=>headers.map(h=>csvEscape(r[h as keyof typeof r])).join(","))].join("\r\n");
  return new Response(body,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=retailai-catalog.csv"}});
}
