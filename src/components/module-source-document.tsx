import { Download, ExternalLink, FileText } from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { getModulePdfUrl } from "@/lib/module-page";

export function ModuleSourceDocument({ courseModule }: { courseModule: CourseModule }) {
  const pdfUrl = getModulePdfUrl(courseModule.pdfFile);

  return (
    <section
      id="material-fuente"
      className="scroll-mt-24 overflow-hidden border border-slate-700 bg-[#071A2B] text-white shadow-card"
    >
      <header className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
            <FileText size={22} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase text-cyan-200">
              Material fuente · Módulo {courseModule.order}
            </p>
            <h2 className="mt-1 text-2xl font-black">Cuadernillo completo del módulo</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Este es el documento principal del recorrido. Léelo y consúltalo antes de trabajar
              con el video, el audio, las infografías y las actividades prácticas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15"
          >
            <ExternalLink size={17} />
            Abrir en grande
          </a>
          <a
            href={pdfUrl}
            download
            className="focus-ring inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
          >
            <Download size={17} />
            Descargar PDF
          </a>
        </div>
      </header>

      <iframe
        src={`${pdfUrl}#view=FitH`}
        title={`Cuadernillo fuente del módulo ${courseModule.order}`}
        className="hidden h-[720px] w-full bg-slate-100 sm:block lg:h-[820px]"
      />

      <div className="bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px] p-5 sm:hidden">
        <p className="text-sm leading-6 text-slate-300">
          En móvil, el PDF se abre en el visor del dispositivo para facilitar la lectura y el zoom.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 bg-cyan-100 px-4 py-3 text-sm font-black text-[#071A2B]"
        >
          <ExternalLink size={18} />
          Abrir cuadernillo
        </a>
      </div>
    </section>
  );
}

