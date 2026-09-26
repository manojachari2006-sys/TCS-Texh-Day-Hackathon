import { generateSchema } from "@/lib/validators";
import { runBatch } from "@/lib/generation";
import { apiError } from "@/lib/utils";
import { z } from "zod";

export async function POST(request:Request){
  let input:z.infer<typeof generateSchema>;
  try{input=generateSchema.parse(await request.json())}catch(error){return apiError(error,"VALIDATION_ERROR",400)}
  const encoder=new TextEncoder();
  const stream=new ReadableStream<Uint8Array>({start(controller){
    const send=(event:string,data:unknown)=>controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    void runBatch(input,progress=>send("progress",progress)).then(batch=>{send("done",batch);controller.close()}).catch(error=>{send("error",{message:error instanceof Error?error.message:"Generation failed"});controller.close()});
  }});
  return new Response(stream,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform","Connection":"keep-alive"}});
}
