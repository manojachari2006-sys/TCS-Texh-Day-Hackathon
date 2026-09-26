import { db } from "@/lib/db";
import { styleProfileSchema } from "@/lib/validators";
import { apiError, ok } from "@/lib/utils";
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context){try{const {id}=await params;const s=await db.styleProfile.findUnique({where:{id}});return s?ok(s):apiError(new Error("Style profile not found"),"NOT_FOUND",404)}catch(e){return apiError(e)}}
export async function PUT(request:Request,{params}:Context){try{const {id}=await params;const data=styleProfileSchema.parse(await request.json());if(data.isActive)await db.styleProfile.updateMany({where:{id:{not:id}},data:{isActive:false}});return ok(await db.styleProfile.update({where:{id},data}))}catch(e){return apiError(e,"STYLE_UPDATE_FAILED",400)}}
export async function DELETE(_:Request,{params}:Context){try{const {id}=await params;await db.styleProfile.delete({where:{id}});return ok({deleted:true})}catch(e){return apiError(e,"STYLE_DELETE_FAILED",400)}}
