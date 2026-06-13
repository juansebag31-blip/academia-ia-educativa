import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Download,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { buildModuleExamSummary } from "@/lib/module-page";

type LatestAttempt = {
  correct: number;
  total: number;
  percent: number;
  passed: number;
};

export function ModuleExamCallout({
  courseModule,
  courseSlug,
  latestAttempt,
}: {
  courseModule: CourseModule;
  courseSlug: string;
  latestAttempt?: LatestAttempt;
}) {
  const summary = buildModuleExamSummary(courseModule, latestAttempt);
  const passed = summary.status === "passed";
  const retry = summary.status === "retry";

  return (
    <section className="overflow-hidden border border-slate-700 bg-[#071A2B] text-white shadow-card">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
              <Award size={25} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-cyan-200">
                Cierre y validación del módulo
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Examen final de 20 preguntas</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Cuando termines el cuadernillo, los materiales y las actividades, valida tu dominio.
                Necesitas responder correctamente al menos el 80% para aprobar el módulo.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-px bg-white/10 sm:grid-cols-3">
            <ExamMetric value={`${summary.totalQuestions}`} label="preguntas" />
            <ExamMetric value={`${summary.passingPercent}%`} label="mínimo para aprobar" />
            <ExamMetric value={`${courseModule.certificateHours} horas`} label="carga estimada" />
          </div>
        </div>

        <aside className="flex flex-col justify-between border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Estado de evaluación</p>
            <div className="mt-4 flex items-start gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center ${
                  passed
                    ? "bg-emerald-400/15 text-emerald-300"
                    : retry
                      ? "bg-amber-400/15 text-amber-200"
                      : "bg-white/10 text-cyan-100"
                }`}
              >
                {passed ? (
                  <CheckCircle2 size={21} />
                ) : retry ? (
                  <RotateCcw size={21} />
                ) : (
                  <ClipboardCheck size={21} />
                )}
              </span>
              <div>
                <h3 className="font-black">
                  {passed
                    ? "Módulo aprobado"
                    : retry
                      ? "Examen pendiente de aprobación"
                      : "Aún no realizaste el examen"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {latestAttempt
                    ? `Último intento: ${latestAttempt.percent}% · ${latestAttempt.correct}/${latestAttempt.total} correctas.`
                    : "El resultado quedará registrado en tu progreso cuando lo completes."}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/courses/${courseSlug}/modules/${courseModule.slug}/exam`}
            className="focus-ring mt-7 inline-flex w-full items-center justify-between bg-cyan-100 px-5 py-3.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
          >
            {summary.actionLabel}
            <ArrowRight size={18} />
          </Link>

          <div className="mt-3 border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-cyan-200">
                {passed ? <Award size={20} /> : <LockKeyhole size={20} />}
              </span>
              <div>
                <p className="text-sm font-black">Certificado de aprobación</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Documento académico interno de {courseModule.certificateHours} horas estimadas.
                  Se habilita al superar el examen con 80% o más.
                </p>
              </div>
            </div>

            {passed ? (
              <a
                href={`/api/certificates/modules/${courseModule.slug}`}
                download
                className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 border border-cyan-200/30 bg-cyan-100/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-100 hover:text-[#071A2B]"
              >
                <Download size={18} />
                Descargar certificado PDF
              </a>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-500">
                <LockKeyhole size={17} />
                Certificado bloqueado
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ExamMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/[0.06] p-4">
      <p className="text-xl font-black text-cyan-100">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase text-slate-300">{label}</p>
    </div>
  );
}

