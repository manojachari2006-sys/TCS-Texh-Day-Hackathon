import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/product-form";
export const dynamic="force-dynamic";
export default async function EditProduct({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await db.product.findUnique({where:{id}});if(!p)notFound();const initialData={sku:p.sku,name:p.name,brand:p.brand,category:p.category,subcategory:p.subcategory,features:p.features,specifications:p.specifications,price:p.price,currency:p.currency,targetAudience:p.targetAudience,benefits:p.benefits,materials:p.materials,color:p.color,size:p.size,availability:p.availability,imageUrl:p.imageUrl,seoKeywords:p.seoKeywords};return <div className="max-w-3xl space-y-6"><div><Link href={`/products/${id}`} className="text-xs font-semibold text-[#087f5b]">← Product details</Link><h1 className="text-3xl font-extrabold mt-3">Edit product</h1></div><section className="card p-5 md:p-7"><ProductForm productId={id} initialData={initialData}/></section></div>}
