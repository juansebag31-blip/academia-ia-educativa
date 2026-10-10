"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Images,
  Layers3,
  Lightbulb,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import { courseSeed } from "@/lib/course-seed";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  assistant?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Cursos", icon: BookOpen },
  { href: "/program", label: "Programa", icon: FileText },
  { href: "/modules", label: "Módulos", icon: Layers3 },
  { href: "/visual", label: "Vista visual", icon: Images },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/live-classes", label: "Modo de uso", icon: HelpCircle },
  { href: "/reflection", label: "Reflexión", icon: Lightbulb },
];

export function buildAssistantHref(pathname: string) {
  const moduleMatch = pathname.match(/^\/courses\/([^/]+)\/modules\/([^/]+)/);
  if (moduleMatch?.[1] === courseSeed.slug) {
    return `/courses/${moduleMatch[1]}/modules/${moduleMatch[2]}#asistente-ia`;
  }

  const courseMatch = pathname.match(/^\/courses\/([^/]+)/);
  const courseSlug = courseMatch?.[1] === courseSeed.slug ? courseMatch[1] : courseSeed.slug;
  return `/courses/${courseSlug}#asistente-ia`;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/courses");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavLinks({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items: NavItem[] = [
    navItems[0],
    {
      href: buildAssistantHref(pathname),
      label: "Asistente IA",
      icon: MessageCircleQuestion,
      assistant: true,
    },
    ...navItems.slice(1),
  ];

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = !item.assistant && isActivePath(pathname, item.href);
        const inactiveClassName = item.assistant
          ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-50 hover:border-cyan-200/40 hover:bg-cyan-300/15"
          : "text-neutral-300 hover:bg-white/8 hover:text-white";

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
              collapsed ? "justify-center px-3" : ""
            } ${active ? "bg-gradient-to-r from-ember to-cognitive-violet text-white shadow-lg shadow-blue-950/20" : inactiveClassName}`}
          >
            <Icon size={19} aria-hidden="true" />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </>
  );
}

