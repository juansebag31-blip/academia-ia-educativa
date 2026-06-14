import { Clock3, Download, Headphones, PlaySquare } from "lucide-react";
import { programMedia } from "@/lib/program-media";
import { getOptimizedVideoSrc } from "@/lib/course-assets";
import { DeferredAudio, DeferredVideo } from "./deferred-media";

export function ProgramMediaSection() {
  return (
    <section className="overflow-hidden border border-slate-700 bg-[#071A2B] text-white shadow-card">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <p className="text-xs font-bold uppercase text-cyan-200">Programa en múltiples formatos</p>
        <h2 className="mt-2 text-2xl font-black">Escucha y visualiza el recorrido completo</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Dos recursos creados con NotebookLM a partir del cuadernillo institucional de 95 páginas.
          Úsalos como introducción, repaso o visión general antes de comenzar los módulos.
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <article className="border-b border-white/10 lg:border-b-0 lg:border-r">
          <div className="aspect-video bg-black">
            <DeferredVideo
              src={programMedia.video.src}
              type={programMedia.video.type}
              poster={programMedia.video.poster}
              title={programMedia.video.title}
            />
          </div>
          <MediaDetails
            icon={<PlaySquare size={18} />}
            kind="Video explicativo"
            title={programMedia.video.title}
            description={programMedia.video.description}
            duration={programMedia.video.duration}
            downloadHref={getOptimizedVideoSrc(programMedia.video.src)}
            downloadLabel="Descargar video"
          />
        </article>

        <article className="flex min-h-full flex-col justify-between bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="p-5 sm:p-6">
            <span className="flex size-12 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
              <Headphones size={24} />
            </span>
            <p className="mt-6 text-xs font-bold uppercase text-cyan-200">Audio resumen</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">{programMedia.audio.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{programMedia.audio.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-200">
              <Clock3 size={16} className="text-cyan-200" />
              {programMedia.audio.duration}
            </p>
          </div>

          <div className="border-t border-white/10 p-5 sm:p-6">
            <DeferredAudio
              src={programMedia.audio.src}
              type={programMedia.audio.type}
              title={programMedia.audio.title}
            />
            <a
              href={programMedia.audio.src}
              download
              className="focus-ring mt-4 inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
            >
              <Download size={17} />
              Descargar audio
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function MediaDetails({
  icon,
  kind,
  title,
  description,
  duration,
  downloadHref,
  downloadLabel,
}: {
  icon: React.ReactNode;
  kind: string;
  title: string;
  description: string;
  duration: string;
  downloadHref: string;
  downloadLabel: string;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase text-cyan-200">
        <span className="inline-flex items-center gap-2">
          {icon}
          {kind}
        </span>
        <span className="inline-flex items-center gap-2 text-slate-300">
          <Clock3 size={15} />
          {duration}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-black">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
      <a
        href={downloadHref}
        download
        className="focus-ring mt-4 inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
      >
        <Download size={17} />
        {downloadLabel}
      </a>
    </div>
  );
}

