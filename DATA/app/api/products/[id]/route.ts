import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { apiError, ok } from "@/lib/utils";
import { z } from "zod";
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context){try{const {id}=await params;const p=await db.product.findUnique({where:{id},include:{descriptions:{orderBy:{createdAt:"desc"}},jobs:{orderBy:{createdAt:"desc"},take:10}}});return p?ok(p):apiError(new Error("Product not found"),"NOT_FOUND",404)}catch(e){return apiError(e)}}
export async function PUT(request:Request,{params}:Context){try{const {id}=await params;const data=productSchema.parse(await request.json());return ok(await db.product.update({where:{id},data}))}catch(e){return apiError(e,e instanceof z.ZodError?"VALIDATION_ERROR":"UPDATE_FAILED",e instanceof z.ZodError?400:404)}}
export async function DELETE(_:Request,{params}:Context){try{const {id}=await params;await db.product.delete({where:{id}});return ok({deleted:true})}catch(e){return apiError(e,"DELETE_FAILED",404)}}
