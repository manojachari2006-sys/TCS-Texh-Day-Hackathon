import { db } from "@/lib/db";
import { apiError, ok } from "@/lib/utils";
import { z } from "zod";
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context){try{const {id}=await params;const [description,batch]=await Promise.all([db.generatedDescription.findUnique({where:{id},include:{product:true,styleProfile:true,feedback:true}}),db.generationBatch.findUnique({where:{id},include:{jobs:{include:{product:true},orderBy:{createdAt:"asc"}},styleProfile:true}})]);const result=description||batch;return result?ok(result):apiError(new Error("Generation not found"),"NOT_FOUND",404)}catch(e){return apiError(e)}}
export async function PATCH(request:Request,{params}:Context){try{const {id}=await params;const body=z.object({status:z.enum(["APPROVED","PENDING_REVIEW"]),title:z.string().optional(),shortDescription:z.string().optional(),longDescription:z.string().optional(),seoTitle:z.string().optional(),metaDescription:z.string().optional(),callToAction:z.string().optional()}).parse(await request.json());return ok(await db.generatedDescription.update({where:{id},data:body}))}catch(e){return apiError(e,"UPDATE_GENERATION_FAILED",400)}}
