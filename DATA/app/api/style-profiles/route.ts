import { db } from "@/lib/db";
import { styleProfileSchema } from "@/lib/validators";
import { apiError, ok } from "@/lib/utils";
export async function GET(){try{return ok(await db.styleProfile.findMany({orderBy:[{isActive:"desc"},{name:"asc"}]}))}catch(e){return apiError(e)}}
export async function POST(request:Request){try{const data=styleProfileSchema.parse(await request.json());if(data.isActive)await db.styleProfile.updateMany({data:{isActive:false}});return ok(await db.styleProfile.create({data}),201)}catch(e){return apiError(e,"STYLE_CREATE_FAILED",400)}}
