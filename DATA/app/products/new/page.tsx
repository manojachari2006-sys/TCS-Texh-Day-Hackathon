import Link from "next/link";
import { ProductForm } from "@/components/product-form";
export default function NewProduct(){return <div className="max-w-3xl space-y-6"><div><Link href="/products" className="text-xs font-semibold text-[#087f5b]">← Products</Link><h1 className="text-3xl font-extrabold mt-3">Add a product</h1><p className="text-sm text-[#7b8983] mt-2">Add structured product facts for reliable descriptions.</p></div><section className="card p-5 md:p-7"><ProductForm/></section></div>}
