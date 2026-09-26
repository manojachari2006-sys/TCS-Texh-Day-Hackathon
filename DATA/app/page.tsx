import Link from "next/link";
import { db } from "@/lib/db";
import { DashboardCharts } from "@/components/dashboard-charts";
import { LoadDemoButton } from "@/components/load-demo-button";
import { ArrowDownRight, ArrowUpRight, Check, CircleAlert, FileUp, Package, Sparkles, WandSparkles } from "lucide-react";

export const dynamic="force-dynamic";
export default async function Dashboard(){
  let total=0,descriptions=0,approved=0,quality=0,seo=0,pending=0,activity:{label:string;count:number}[]=[],categories:{name:string;count:number}[]=[],batches:{id:string;name:string;status:string;completedProducts:number;totalProducts:number;createdAt:Date}[]=[];
  try{
    const [productCount,all,batchRows,byCategory]=await Promise.all([db.product.count(),db.generatedDescription.findMany({select:{qualityScore:true,seoScore:true,status:true,createdAt:true}}),db.generationBatch.findMany({orderBy:{createdAt:"desc"},take:5}),db.product.groupBy({by:["category"],_count:{_all:true}})]);
    total=productCount;descriptions=all.length;approved=all.filter(x=>x.status==="APPROVED").length;pending=all.filter(x=>x.status==="PENDING_REVIEW").length;
    quality=all.length?Math.round(all.reduce((s,x)=>s+x.qualityScore,0)/all.length):0;seo=all.length?Math.round(all.reduce((s,x)=>s+x.seoScore,0)/all.length):0;
    activity=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const day=d.toISOString().slice(0,10);return{label:d.toLocaleDateString("en",{weekday:"short"}),count:all.filter(x=>x.createdAt.toISOString().slice(0,10)===day).length}});
    categories=byCategory.map(c=>({name:c.category,count:c._count._all}));batches=batchRows;
  }catch{}
  const stats=[{label:"Total products",value:total,icon:Package,delta:"Catalog items"},{label:"Generated descriptions",value:descriptions,icon:Sparkles,delta:"Across all products"},{label:"Average quality",value:`${quality}%`,icon:ArrowUpRight,delta:"Heuristic score"},{label:"Average SEO",value:`${seo}%`,icon:ArrowDownRight,delta:"Heuristic score"},{label:"Approved",value:approved,icon:Check,delta:"Ready to export"},{label:"Pending review",value:pending,icon:CircleAlert,delta:"Awaiting approval"}];
  return <div className="space-y-7"><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><div className="text-xs font-bold text-[#08835e] uppercase tracking-[.13em] mb-2">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div><h1 className="text-3xl md:text-[34px] font-extrabold tracking-tight">Good morning, catalog team <span>✦</span></h1><p className="text-sm text-[#788781] mt-2">Your product content workspace at a glance.</p></div><div className="flex gap-2 flex-wrap"><LoadDemoButton/><Link className="btn" href="/import"><FileUp size={15}/>Import</Link><Link className="btn btn-primary" href="/generate"><WandSparkles size={15}/>Generate descriptions</Link></div></div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{stats.map((s,i)=>{const Icon=s.icon;return <div key={s.label} className="card px-5 py-4 flex items-center justify-between"><div><div className="text-xs text-[#75837d] font-semibold">{s.label}</div><div className="text-[27px] font-extrabold mt-2 tracking-tight">{s.value}</div><div className="text-[11px] text-[#95a19c] mt-1">{s.delta}</div></div><div className={`w-10 h-10 rounded-xl grid place-items-center ${i%2===0?"bg-[#e9f7ef] text-[#09805b]":"bg-[#fff4e4] text-[#be7d20]"}`}><Icon size={19}/></div></div>})}</div>
    <DashboardCharts activity={activity} categories={categories}/>
    <section className="card overflow-hidden"><div className="p-5 md:px-6 flex items-center justify-between"><div><h2 className="font-bold">Recent generation batches</h2><p className="text-xs text-[#82908b] mt-1">Latest catalog runs</p></div><Link className="text-xs font-bold text-[#087f5b]" href="/batches">View all batches →</Link></div>{batches.length?<div className="overflow-x-auto"><table className="table w-full"><thead><tr><th>Batch</th><th>Status</th><th>Completed</th><th>Created</th></tr></thead><tbody>{batches.map(b=><tr key={b.id}><td className="font-semibold">{b.name}</td><td><span className="pill">{b.status}</span></td><td>{b.completedProducts}/{b.totalProducts}</td><td>{new Date(b.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="px-6 pb-6 text-sm text-[#84918c]">No batches yet. Select products and run your first generation.</div>}</section>
  </div>
}
