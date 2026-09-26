import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductFacts } from "@/lib/ai/types";
const mocks=vi.hoisted(()=>({
  products:[{id:"1",sku:"A",name:"Item A",brand:"",category:"Home",subcategory:"",features:["Soft"],specifications:[],benefits:[],materials:[],price:100,currency:"INR",targetAudience:"everyone",color:"",size:"",availability:"In Stock",seoKeywords:["soft item"]},{id:"2",sku:"B",name:"Item B",brand:"",category:"Home",subcategory:"",features:["Useful"],specifications:[],benefits:[],materials:[],price:200,currency:"INR",targetAudience:"everyone",color:"",size:"",availability:"In Stock",seoKeywords:["useful item"]},{id:"3",sku:"FAIL",name:"Item C",brand:"",category:"Home",subcategory:"",features:["Useful"],specifications:[],benefits:[],materials:[],price:200,currency:"INR",targetAudience:"everyone",color:"",size:"",availability:"In Stock",seoKeywords:[]}],
  db:{product:{findMany:vi.fn()},styleProfile:{findFirst:vi.fn()},generationBatch:{create:vi.fn(),update:vi.fn()},generationJob:{findMany:vi.fn(),update:vi.fn()},generatedDescription:{create:vi.fn()}},provider:{model:"mock-test",generate:vi.fn()}
}));
vi.mock("@/lib/db",()=>({db:mocks.db}));
vi.mock("@/lib/ai/provider",()=>({getAIProvider:()=>mocks.provider}));
import { runBatch } from "@/lib/generation";

describe("batch generation",()=>{
 beforeEach(()=>{mocks.db.product.findMany.mockResolvedValue(mocks.products);mocks.db.styleProfile.findFirst.mockResolvedValue(null);mocks.db.generationBatch.create.mockResolvedValue({id:"batch-1"});mocks.db.generationJob.findMany.mockResolvedValue(mocks.products.map((p,i)=>({id:`job-${i+1}`,productId:p.id})));mocks.db.generatedDescription.create.mockResolvedValue({});mocks.db.generationJob.update.mockResolvedValue({});mocks.db.generationBatch.update.mockImplementation(async(args:{data:Record<string,unknown>})=>({id:"batch-1",...args.data}));mocks.provider.generate.mockImplementation(async(p:ProductFacts)=>{if(p.sku==="FAIL")throw Error("Mock row error");return {title:p.name,shortDescription:"A useful item.",longDescription:"A useful item for daily use.",sellingPoints:["Useful"],featureBenefits:["Useful benefit"],seoTitle:p.name,metaDescription:"A useful item for daily use and a practical choice.",seoKeywords:p.seoKeywords,tags:[p.category],callToAction:"Explore it."}})});
 it("continues after a failed product and records batch totals",async()=>{const result=await runBatch({productIds:["1","2","3"]});expect(result.status).toBe("Completed With Errors");expect(result.completedProducts).toBe(2);expect(result.failedProducts).toBe(1);expect(mocks.db.generatedDescription.create).toHaveBeenCalledTimes(2);});
});
