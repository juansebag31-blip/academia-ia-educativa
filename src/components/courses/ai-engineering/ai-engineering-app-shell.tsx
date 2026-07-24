"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Blocks,
  BookOpenCheck,
  ChevronRight,
  Cpu,
  FolderKanban,
  GraduationCap,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { buildAuthHref } from "@/lib/auth/return-path";
import {
  AI_ENGINEERING_COURSE_HREF,
  AI_ENGINEERING_COURSE_SLUG,
  getAiEngineeringModuleNumber,
} from "@/lib/courses/ai-engineering/routes";

const contextLinks = [
  { href: AI_ENGINEERING_COURSE_HREF, sectionId: "portada", label: "Portada", icon: GraduationCap },
  { href: `${AI_ENGINEERING_COURSE_HREF}#resultados`, sectionId: "resultados", label: "Resultados", icon: BookOpenCheck },
  { href: `${AI_ENGINEERING_COURSE_HREF}#arquitectura`, sectionId: "arquitectura", label: "Arquitectura", icon: Blocks },
  { href: `${AI_ENGINEERING_COURSE_HREF}#proyecto`, sectionId: "proyecto", label: "Proyecto JSG", icon: FolderKanban },
  { href: `${AI_ENGINEERING_COURSE_HREF}#programa`, sectionId: "programa", label: "12 módulos", icon: Route },
] as const;

type CourseSectionId = (typeof contextLinks)[number]["sectionId"];

export function AiEngineeringAppShell({
  children,
  user,
  pageLabel,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
  pageLabel?: string;
}) {
  const pathname = usePathname();
  const moduleNumber = getAiEngineeringModuleNumber(pathname);
  const [activeSection, setActiveSection] = useActiveCourseSection(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    if (mobileMenuOpen) closeMenuButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      openMenuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    openMenuButtonRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-[#0b1f33]">
      <a
        href="#contenido-principal"
        className="focus-ring fixed left-4 top-3 z-[70] -translate-y-24 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0b1f33] shadow-xl focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-white/10 bg-[#071a2b] text-white transition-[width] duration-300 lg:block ${
          collapsed ? "w-[92px]" : "w-[264px]"
        }`}
        aria-label="Navegación de AI Engineering"
      >
        <div className={`flex h-28 items-center border-b border-white/10 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed ? <AiEngineeringBrand /> : <AiEngineeringBrand compact />}
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="focus-ring shrink-0 rounded-full border border-white/15 p-2 text-slate-300 hover:border-[#5eead4]/60 hover:text-white"
            aria-label={collapsed ? "Expandir navegación del curso" : "Contraer navegación del curso"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <ContextNavigation
          pathname={pathname}
          collapsed={collapsed}
          moduleNumber={moduleNumber}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-[#071a2b]/70 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={closeMobileMenu}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] overflow-y-auto bg-[#071a2b] text-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegación móvil de AI Engineering"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-4">
          <AiEngineeringBrand />
          <button
            ref={closeMenuButtonRef}
            type="button"
            onClick={closeMobileMenu}
            className="focus-ring rounded-full border border-white/15 p-2 text-slate-300 hover:text-white"
            aria-label="Cerrar navegación"
          >
            <X size={20} />
          </button>
        </div>
        <ContextNavigation
          pathname={pathname}
          moduleNumber={moduleNumber}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onNavigate={closeMobileMenu}
        />
      </aside>

      <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[92px]" : "lg:pl-[264px]"}`}>
        <header className="sticky top-0 z-20 border-b border-[#0f766e]/15 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:min-h-20 sm:px-8">
            <button
              ref={openMenuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="focus-ring rounded-xl border border-[#0f766e]/20 bg-white p-2 text-[#0b1f33] shadow-sm lg:hidden"
              aria-label="Abrir navegación del curso"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            <CourseBreadcrumb moduleNumber={moduleNumber} pageLabel={pageLabel} />

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full border border-[#0f766e]/15 bg-[#e8f5f2] px-3 py-1.5 text-xs font-black text-[#0f766e] md:inline-flex">
                Programa completo · 12 módulos
              </span>
              {user ? (
                <Link href="/account" className="focus-ring flex items-center gap-3 rounded-2xl border border-[#0f766e]/20 bg-[#f3f7f6] px-2 py-2 sm:px-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#0f766e] text-sm font-bold text-white sm:size-10">{user.initials}</span>
                  <span className="hidden max-w-36 truncate text-sm font-bold sm:block">{user.displayName}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={buildAuthHref("/auth/login", {
                      returnTo: AI_ENGINEERING_COURSE_HREF,
                      courseSlug: AI_ENGINEERING_COURSE_SLUG,
                    })}
                    className="focus-ring rounded-xl border border-[#0f766e]/20 px-3 py-2 text-sm font-black text-[#0b1f33] hover:bg-[#f3f7f6]"
                  >
                    Entrar
                  </Link>
                  <Link
                    href={buildAuthHref("/auth/register", {
                      returnTo: AI_ENGINEERING_COURSE_HREF,
                      courseSlug: AI_ENGINEERING_COURSE_SLUG,
                    })}
                    className="focus-ring hidden rounded-xl bg-[#0f766e] px-3 py-2 text-sm font-black text-white hover:bg-[#0b5f59] sm:inline-flex"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="contenido-principal" className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function ContextNavigation({
  pathname,
  collapsed = false,
  moduleNumber,
  activeSection,
  onSectionChange,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  moduleNumber?: number;
  activeSection: CourseSectionId | null;
  onSectionChange: (sectionId: CourseSectionId) => void;
  onNavigate?: () => void;
}) {
  return (
    <nav className="p-4">
      {!collapsed ? (
        <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5eead4]">
          Explorar el curso
        </p>
      ) : null}
      <div className="space-y-2">
        {contextLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === AI_ENGINEERING_COURSE_HREF && activeSection === item.sectionId;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => {
                onSectionChange(item.sectionId);
                onNavigate?.();
              }}
              aria-current={active ? (item.sectionId === "portada" ? "page" : "location") : undefined}
              className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition motion-reduce:transition-none ${
                collapsed ? "justify-center" : ""
              } ${active ? "bg-[#0f766e] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={19} aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </div>

      {moduleNumber ? (
        <div className={`mt-6 border-t border-white/10 pt-5 ${collapsed ? "text-center" : ""}`}>
          <Link
            href={AI_ENGINEERING_COURSE_HREF}
            onClick={onNavigate}
            className="focus-ring block rounded-2xl border border-[#5eead4]/20 bg-white/5 p-3 hover:border-[#5eead4]/45"
            title={collapsed ? "Volver a AI Engineering Aplicado" : undefined}
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] font-mono text-xs font-black text-white">
                {String(moduleNumber).padStart(2, "0")}
              </span>
              {!collapsed ? (
                <span className="text-left">
                  <span className="block text-xs font-black text-white">Módulo actual</span>
                  <span className="mt-0.5 block text-[11px] text-slate-300">Volver a la portada</span>
                </span>
              ) : null}
            </span>
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

function useActiveCourseSection(pathname: string) {
  const [activeSection, setActiveSection] = useState<CourseSectionId | null>(
    pathname === AI_ENGINEERING_COURSE_HREF ? "portada" : null,
  );

  useEffect(() => {
    if (pathname !== AI_ENGINEERING_COURSE_HREF) {
      setActiveSection(null);
      return;
    }

    const sectionElements = contextLinks
      .map(({ sectionId }) => ({
        sectionId,
        element: document.getElementById(sectionId),
      }))
      .filter(
        (
          section,
        ): section is {
          sectionId: CourseSectionId;
          element: HTMLElement;
        } => section.element !== null,
      );

    let animationFrame = 0;

    const sectionFromHash = () => {
      const hash = window.location.hash.slice(1);
      return contextLinks.find(({ sectionId }) => sectionId === hash)?.sectionId ?? null;
    };

    const updateFromScroll = () => {
      const activationLine = Math.min(window.innerHeight * 0.3, 240);
      let visibleSection: CourseSectionId = sectionFromHash() ?? "portada";

      for (const section of sectionElements) {
        if (section.element.getBoundingClientRect().top <= activationLine) {
          visibleSection = section.sectionId;
        }
      }

      setActiveSection(visibleSection);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateFromScroll);
    };

    const updateFromHash = () => {
      const hashSection = sectionFromHash();
      if (hashSection) setActiveSection(hashSection);
      scheduleUpdate();
    };

    setActiveSection(sectionFromHash() ?? "portada");
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [pathname]);

  return [activeSection, setActiveSection] as const;
}

function AiEngineeringBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={AI_ENGINEERING_COURSE_HREF}
      className="focus-ring flex min-w-0 items-center gap-3 rounded-xl"
      aria-label="AI Engineering Aplicado"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] text-[#071a2b] shadow-lg shadow-black/25">
        <Cpu size={24} strokeWidth={2.2} aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-sm font-black leading-tight text-white">AI Engineering</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#5eead4]">Aplicado</span>
        </span>
      ) : null}
    </Link>
  );
}

function CourseBreadcrumb({
  moduleNumber,
  pageLabel,
}: {
  moduleNumber?: number;
  pageLabel?: string;
}) {
  return (
    <nav aria-label="Migas de pan" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li>
          <Link href={AI_ENGINEERING_COURSE_HREF} className="focus-ring rounded-lg font-black text-[#0f766e] hover:text-[#0b1f33]">
            <span className="hidden sm:inline">AI Engineering Aplicado</span>
            <span className="sm:hidden">AI Engineering</span>
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-400"><ChevronRight size={16} /></li>
        <li className="truncate font-bold text-slate-600" aria-current="page">
          {pageLabel ?? (moduleNumber ? `Módulo ${moduleNumber}` : "Portada")}
        </li>
      </ol>
    </nav>
  );
}
