import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import { ProgramInfographicGallery } from "@/components/program-infographic-gallery";
import { ProgramMediaSection } from "@/components/program-media-section";
import { ProgramVisualLibrary } from "@/components/program-visual-library";
import { courseSeed } from "@/lib/course-seed";

const programPdf = "/course-assets/pdfs/Cuadernillo_Institucional_Programa_IA_Educativa_NotebookLM_COMPLETO.pdf";

export default function ProgramPage() {
  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ember">Programa del curso</p>
            <h1 className="mt-2 text-3xl font-black">{courseSeed.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">{courseSeed.description}</p>
          </div>
          <a href={programPdf} className="inline-flex items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white hover:bg-ember-dark">
            <Download size={18} />
            Descargar programa
          </a>
        </div>
      </section>

      <ProgramMediaSection />

      <ProgramVisualLibrary />

      <ProgramInfographicGallery />

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <h2 className="text-xl font-black">Estructura rápida</h2>
          <div className="mt-4 space-y-3">
            {courseSeed.modules.map((courseModule) => (
              <Link
                key={courseModule.slug}
                href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line-soft p-3 text-sm font-bold hover:bg-blue-50"
              >
                <span>{courseModule.title.replace(/^Módulo \d+ - /, "")}</span>
                <ArrowRight className="shrink-0 text-ember" size={16} />
              </Link>
            ))}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-line-soft p-5">
            <FileText className="text-ember" />
            <h2 className="text-xl font-black">Cuadernillo institucional completo</h2>
          </div>
          <iframe className="h-[720px] w-full bg-slate-100" src={programPdf} title="Programa completo del curso" />
        </section>
      </section>
    </div>
  );
}

