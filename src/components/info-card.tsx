import type { LucideIcon } from "lucide-react";

export function InfoCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-blue-50 p-3 text-ember">
          <Icon size={22} />
        </span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="mt-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

