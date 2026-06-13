"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BrainCircuit, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { courseSeed } from "@/lib/course-seed";
import { SearchBox } from "./search-box";
import { SidebarNavLinks } from "./nav-links";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-paper-soft text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-coal text-white transition-all duration-300 lg:block ${
          collapsed ? "w-[88px]" : "w-[244px]"
        }`}
      >
        <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
        <nav className="space-y-2 p-4">
          <SidebarNavLinks collapsed={collapsed} />
        </nav>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] bg-coal text-white shadow-2xl shadow-black/40 transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menú principal"
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-4">
          <CourseBrand />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="focus-ring rounded-full border border-white/15 p-2 text-neutral-300 transition hover:border-white/30 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="space-y-2 p-4">
          <SidebarNavLinks onNavigate={() => setMobileMenuOpen(false)} />
        </nav>
        <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-tech-cyan">Academia IA</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-neutral-200">La revolución del conocimiento</p>
        </div>
      </aside>

      <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[88px]" : "lg:pl-[244px]"}`}>
        <header className="sticky top-0 z-20 border-b border-line-soft bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:min-h-20 sm:px-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="focus-ring rounded-xl border border-line-soft bg-white p-2 text-slate-700 shadow-sm lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="flex min-w-fit items-center gap-2 rounded-full border border-line-soft bg-white px-3 py-2 shadow-sm sm:px-4">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-ember to-cognitive-violet text-sm font-black text-white">IA</span>
              <span className="hidden text-lg font-black tracking-tight sm:block">Academia IA</span>
            </Link>

            <div className="mx-auto hidden w-full max-w-md md:block">
              <SearchBox course={courseSeed} />
            </div>

            <button type="button" className="focus-ring ml-auto rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Notificaciones">
              <Bell size={21} />
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-2 py-2 sm:px-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white sm:h-10 sm:w-10">JS</span>
              <div className="hidden sm:block">
                <p className="text-sm font-bold">Juan Sebastian</p>
                <p className="text-xs text-slate-500">Estudiante privado</p>
              </div>
            </div>
          </div>
          <div className="block border-t border-line-soft px-4 py-3 md:hidden">
            <SearchBox course={courseSeed} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className={`flex h-24 items-center border-b border-white/10 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
      {!collapsed ? <CourseBrand /> : null}
      <button
        type="button"
        onClick={onToggle}
        className="focus-ring rounded-full border border-white/15 p-2 text-neutral-300 transition hover:border-white/30 hover:text-white"
        aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
  );
}

function CourseBrand() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ember via-tech-cyan to-cognitive-violet text-white shadow-lg shadow-blue-950/30">
        <BrainCircuit size={24} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black leading-tight">IA</span>
        <span className="block text-[11px] font-semibold leading-tight text-neutral-300">La revolución del conocimiento</span>
      </span>
    </Link>
  );
}

