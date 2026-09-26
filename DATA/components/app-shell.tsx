"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Boxes, ChartNoAxesCombined, ChevronDown, Cpu, FileUp, LayoutDashboard, Package, Settings, Sparkles, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";
const nav=[
  {href:"/",label:"Dashboard",icon:LayoutDashboard},{href:"/products",label:"Products",icon:Package},{href:"/generate",label:"Generate",icon:WandSparkles},{href:"/batches",label:"Batches",icon:Boxes},{href:"/style",label:"Style Profiles",icon:Sparkles},{href:"/analytics",label:"Analytics",icon:ChartNoAxesCombined},{href:"/settings",label:"Settings",icon:Settings},
];
export function AppShell({children}:{children:ReactNode}){
  const path=usePathname(),[provider,setProvider]=useState("Checking provider");
  useEffect(()=>{void fetch("/api/health").then(r=>r.json()).then(j=>setProvider(j.success?j.data.demoMode?"AI Provider: Demo Mode":"AI Provider: OpenAI":"Provider status unavailable")).catch(()=>setProvider("Provider status unavailable"))},[]);
  return <div className="min-h-screen md:flex">
    <aside className="w-full md:w-[244px] md:fixed md:inset-y-0 bg-white border-r border-[#e5ece8] flex flex-col z-20">
      <div className="h-[72px] flex items-center gap-3 px-6 border-b border-[#edf1ef]"><div className="w-9 h-9 rounded-xl bg-[#087f5b] text-white grid place-items-center"><Sparkles size={19}/></div><div><div className="font-extrabold tracking-tight">retail<span className="text-[#087f5b]">ai</span></div><div className="text-[10px] text-[#82908b] tracking-[.15em] font-bold">CATALOG STUDIO</div></div></div>
      <div className="px-4 pt-6 pb-2 text-[10px] uppercase tracking-[.16em] font-bold text-[#a0aaa6]">Workspace</div>
      <nav className="px-3 space-y-1">{nav.map(item=>{const Icon=item.icon,active=item.href==="/"?path==="/":path===item.href||path.startsWith(item.href+"/");return <Link key={item.href} href={item.href} className={`sidebar-link ${active?"active":""}`}><Icon size={17}/>{item.label}{item.href==="/generate"&&<span className="ml-auto text-[#087f5b]"><ChevronDown size={14}/></span>}</Link>})}</nav>
      <div className="mt-auto p-4"><div className="rounded-2xl p-4 bg-[#f0f8f3] border border-[#deeee4]"><div className="flex gap-2 items-center text-[#087f5b] text-xs font-bold"><Cpu size={14}/>{provider}</div><p className="text-[11px] leading-5 text-[#6c7c76] mt-2 mb-3">{provider.includes("Demo")?"Mock generation is ready. No API key required.":"Generation provider status is available in settings."}</p><Link href="/settings" className="text-[11px] font-bold text-[#087f5b]">Provider settings →</Link></div><div className="pt-4 flex items-center gap-2 text-[11px] text-[#94a09b]"><Activity size={13}/> TCS Technology Day</div></div>
    </aside>
    <div className="md:ml-[244px] min-h-screen flex-1 min-w-0"><header className="h-[72px] bg-white/90 backdrop-blur border-b border-[#e5ece8] px-5 md:px-9 flex items-center justify-between sticky top-0 z-10"><div className="text-sm text-[#7c8984]">Workspace <span className="mx-2 text-[#c3cbc7]">/</span><span className="text-[#18322c] font-semibold">{nav.find(n=>n.href===(path==="/"?"/":`/${path.split("/")[1]}`))?.label||"Catalog"}</span></div><div className="flex items-center gap-3"><span className="hidden sm:flex items-center gap-2 text-xs text-[#5f706a]"><span className="w-2 h-2 rounded-full bg-[#20ad78]"/>Demo environment</span><div className="w-9 h-9 rounded-full bg-[#e4f2e9] text-[#087f5b] grid place-items-center font-bold text-xs">RT</div></div></header><main className="max-w-[1440px] mx-auto p-5 md:p-9">{children}</main></div>
  </div>
}
