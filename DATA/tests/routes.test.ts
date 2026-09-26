import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({productFindMany:vi.fn(),queryRaw:vi.fn()}));
vi.mock("@/lib/db",()=>({db:{product:{findMany:mocks.productFindMany},$queryRaw:mocks.queryRaw}}));
import { GET as exportCatalog } from "@/app/api/products/export/route";
import { GET as health } from "@/app/api/health/route";

describe("API route responses",()=>{
  beforeEach(()=>{mocks.productFindMany.mockReset();mocks.queryRaw.mockReset();});
  it("exports catalog records as safe CSV",async()=>{mocks.productFindMany.mockResolvedValue([{sku:"=2+2",name:"Bottle",category:"Travel",currency:"INR",price:500,descriptions:[]}]);const response=await exportCatalog(new Request("http://localhost/api/products/export?format=csv"));const body=await response.text();expect(response.headers.get("content-type")).toContain("text/csv");expect(body).toContain("'=2+2");expect(body).toContain("Product Name");});
  it("exports catalog records as JSON",async()=>{mocks.productFindMany.mockResolvedValue([{sku:"B-1",name:"Bottle",category:"Travel",currency:"INR",price:500,descriptions:[]}]);const response=await exportCatalog(new Request("http://localhost/api/products/export?format=json"));const body=await response.json();expect(response.headers.get("content-type")).toContain("application/json");expect(body[0]["Product Name"]).toBe("Bottle");});
  it("reports provider and database health without exposing credentials",async()=>{mocks.queryRaw.mockResolvedValue([{ok:1}]);const response=await health();const body=await response.json();expect(body.success).toBe(true);expect(body.data.aiProvider).toBe("mock");expect(JSON.stringify(body)).not.toContain("OPENAI_API_KEY");});
});
