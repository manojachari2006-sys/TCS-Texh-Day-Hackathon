import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { addUniqueSku, csvArray, parseCsv } from "@/lib/csv";
import { apiError, ok } from "@/lib/utils";

const columns=["sku","name","brand","category","subcategory","features","specifications","price","currency","targetAudience","benefits","materials","color","size","availability","imageUrl","seoKeywords"];
export async function POST(request:Request){
  try{
    const form=await request.formData(), file=form.get("file");
    if(!(file instanceof File))return apiError(new Error("Choose a CSV or JSON file"),"INVALID_FILE",400);
    if(file.size>5*1024*1024)return apiError(new Error("File size must be 5 MB or less"),"FILE_TOO_LARGE",413);
    const text=await file.text();let records:unknown[];const errors:{row:number;message:string}[]=[];
    if(file.name.toLowerCase().endsWith(".json")||file.type.includes("json")){const parsed=JSON.parse(text);if(!Array.isArray(parsed))throw new Error("JSON import must be an array of product objects");records=parsed;}
    else if(file.name.toLowerCase().endsWith(".csv")||file.type.includes("csv")){
      const rows=parseCsv(text);const heads=rows.shift()?.map(h=>h.trim());if(!heads||columns.some(c=>!heads.includes(c)))throw new Error(`CSV must include columns: ${columns.join(", ")}`);
      records=rows.map((row,rowIndex)=>{
        if(row.length!==heads.length){errors.push({row:rowIndex+1,message:`Expected ${heads.length} columns, found ${row.length}`});return null;}
        return Object.fromEntries(heads.map((h,i)=>[h,["features","specifications","benefits","materials","seoKeywords"].includes(h)?csvArray(row[i]||""):row[i]||""]));
      });
    } else return apiError(new Error("Only CSV and JSON files are supported"),"INVALID_FILE_TYPE",400);
    if(records.length===0)throw new Error("The import file contains no product records");
    const seen=new Set<string>();
    const validRows:{product:ReturnType<typeof productSchema.parse>;row:number}[]=[];
    records.forEach((record,index)=>{if(record===null)return;const parsed=productSchema.safeParse(record);if(!parsed.success){errors.push({row:index+1,message:parsed.error.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("; ")});return;}if(!addUniqueSku(parsed.data.sku,seen)){errors.push({row:index+1,message:`Duplicate SKU in file: ${parsed.data.sku}`});return;}validRows.push({product:parsed.data,row:index+1});});
    let imported=0;
    for(const {product,row} of validRows){try{await db.product.create({data:product});imported++;}catch{errors.push({row,message:`SKU already exists: ${product.sku}`});}}
    return ok({imported,failed:errors.length,total:records.length,errors});
  }catch(e){return apiError(e,"IMPORT_FAILED",400)}
}
