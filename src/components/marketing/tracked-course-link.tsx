"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackMarketingEvent } from "@/lib/marketing/analytics";

export function TrackedCourseLink() {
  return (
    <Link href="/dashboard" onClick={() => trackMarketingEvent("course_cta_click")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-6 py-4 text-sm font-black text-white shadow-2xl shadow-fuchsia-950/30 transition hover:brightness-110">
      Empezar el curso gratis <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
