import { NextResponse } from "next/server";
import { ZodError } from "zod";
export function apiError(error: unknown, code = "INTERNAL_ERROR", status = 500) {
  if (error instanceof ZodError) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid request data",details:error.issues}}, {status:400});
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json({success:false,error:{code,message,details:[]}}, {status});
}
export const ok = (data: unknown, status=200) => NextResponse.json({success:true,data}, {status});
