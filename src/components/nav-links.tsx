"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, FileText, HelpCircle, Images, Layers3, Lightbulb } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Cursos", icon: BookOpen },
  { href: "/program", label: "Programa", icon: FileText },
  { href: "/modules", label: "Módulos", icon: Layers3 },
  { href: "/visual", label: "Vista visual", icon: Images },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/live-classes", label: "Modo de uso", icon: HelpCircle },
  { href: "/reflection", label: "Reflexión", icon: Lightbulb },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/courses");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavLinks({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
              collapsed ? "justify-center px-3" : ""
            } ${active ? "bg-gradient-to-r from-ember to-cognitive-violet text-white shadow-lg shadow-blue-950/20" : "text-neutral-300 hover:bg-white/8 hover:text-white"}`}
          >
            <Icon size={19} />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </>
  );
}

