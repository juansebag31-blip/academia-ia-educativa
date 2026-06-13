import { Award, CheckCircle2, FileCheck2, GitBranch, Lightbulb, Target } from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { buildModuleInfographic } from "@/lib/infographics";

export function ModuleInfographic({ courseModule }: { courseModule: CourseModule }) {
  const infographic = buildModuleInfographic(courseModule);

  return (
    <section className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
      <div className="grid gap-0 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="relative bg-ink p-6 text-white">
          <div className="absolute right-5 top-5 rounded-full border border-white/15 px-3 py-1 text-xs font-black text-blue-200">
            Módulo {courseModule.order}
          </div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-200">Mapa visual del módulo</p>
          <h2 className="mt-3 text-3xl font-black leading-tight">{courseModule.title.replace(/^Módulo \d+ - /, "")}</h2>
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-blue-200">
              <Target size={18} />
              <p className="text-xs font-black uppercase tracking-wide">Problema que resuelve</p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">{infographic.problem}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-50 p-3 text-ember">
                  <Lightbulb size={22} />
                </span>
                <div>
                  <h3 className="text-xl font-black">Ideas clave</h3>
                  <p className="text-sm text-slate-500">Vista rápida de las lecciones principales.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {infographic.keyIdeas.map((idea, index) => (
                  <article key={idea} className="rounded-2xl border border-line-soft bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-ember">Idea {index + 1}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{idea}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-line-soft bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-ember">
                  <GitBranch size={19} />
                  <h3 className="font-black">Flujo recomendado</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {infographic.workflow.map((step, index) => (
                    <div key={step.label} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-ember shadow-sm">{index + 1}</span>
                      <div>
                        <p className="text-sm font-black text-ink">{step.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-ember">
                  <FileCheck2 size={19} />
                  <h3 className="font-black">Producto esperado</h3>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{infographic.finalEvidence}</p>
              </div>

              <div className="rounded-2xl border border-line-soft bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Award size={19} />
                  <h3 className="font-black">Validación</h3>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{infographic.examTarget}</p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  <CheckCircle2 size={14} />
                  Checklist + rúbrica + examen
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

