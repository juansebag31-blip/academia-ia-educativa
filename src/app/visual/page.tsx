import { ModuleCard } from "@/components/module-card";
import { courseSeed } from "@/lib/course-seed";

export default function VisualPage() {
  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <p className="text-sm font-bold uppercase tracking-wide text-ember">Vista visual completa</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Curso por módulos visuales</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Tarjetas amplias con imagen, progreso y acceso directo a cada módulo. Esta vista está pensada para explorar el curso de forma rápida y visual.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courseSeed.modules.map((courseModule) => (
          <ModuleCard key={courseModule.slug} courseModule={courseModule} />
        ))}
      </section>
    </div>
  );
}
