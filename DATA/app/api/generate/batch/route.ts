import { generateSchema } from "@/lib/validators";
import { runBatch } from "@/lib/generation";
import { apiError, ok } from "@/lib/utils";
export async function POST(request:Request){try{const body=generateSchema.parse(await request.json());const batch=await runBatch(body);return ok(batch,201)}catch(e){return apiError(e,"GENERATION_FAILED",400)}}
