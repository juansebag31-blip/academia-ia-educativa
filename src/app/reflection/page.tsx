import { BrainCircuit, FileUp, Lightbulb } from "lucide-react";
import { InfoCard } from "@/components/info-card";
import { ReflectionLab } from "@/components/reflection-lab";

export default function ReflectionPage() {
  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-ember">Espacio personal</p>
        <h1 className="mt-2 text-3xl font-black">Reflexión y creatividad</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Un lugar para registrar ideas propias, conexiones con tu aprendizaje, preguntas para revisar y materiales que inspiren nuevas aplicaciones de IA.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard icon={Lightbulb} title="Ideas personales">
          Captura reflexiones breves después de estudiar una lección o ver un video. El objetivo es convertir información en criterio propio.
        </InfoCard>
        <InfoCard icon={BrainCircuit} title="Creatividad aplicada">
          Registra posibles usos de NotebookLM, actividades, proyectos, prompts o formas de aplicar IA en tu contexto real.
        </InfoCard>
        <InfoCard icon={FileUp} title="Referencias">
          Puedes asociar el nombre de un archivo o recurso que te haya inspirado. En esta fase se guarda localmente como registro de trabajo.
        </InfoCard>
      </div>

      <ReflectionLab />
    </div>
  );
}
