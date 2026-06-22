import { Award, BookOpenCheck, CheckCircle2, ClipboardList, FileText, MousePointerClick, Search, Video } from "lucide-react";
import { InfoCard } from "@/components/info-card";

export default function LiveClassesPage() {
  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-ember">Guía práctica</p>
        <h1 className="mt-2 text-3xl font-black">Modo de uso de la app</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Esta sección explica cómo recorrer el curso, estudiar cada módulo, usar los materiales y registrar el avance hasta completar las evaluaciones.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard icon={BookOpenCheck} title="1. Empezar por Cursos">
          Inicia desde el panel principal. Usa “Continúa donde lo dejaste” para retomar la última lección o entra a los módulos desde las tarjetas.
        </InfoCard>
        <InfoCard icon={ClipboardList} title="2. Revisar el Programa">
          El botón Programa abre la estructura completa del curso y el cuadernillo institucional para consultar el recorrido antes de estudiar.
        </InfoCard>
        <InfoCard icon={MousePointerClick} title="3. Entrar a un módulo">
          Cada módulo reúne lecciones, actividad práctica, PDF fuente, videos sugeridos y el examen de certificación del tema.
        </InfoCard>
        <InfoCard icon={FileText} title="4. Estudiar la lección">
          Lee el contenido estructurado, consulta el PDF adjunto y usa la navegación anterior/siguiente para avanzar sin perder contexto.
        </InfoCard>
        <InfoCard icon={Video} title="5. Ver videos dentro de la app">
          Los videos se cargan en el visor integrado. Puedes reproducirlos en la aplicación o abrirlos en YouTube cuando quieras profundizar.
        </InfoCard>
        <InfoCard icon={Award} title="6. Rendir el examen">
          Al final de cada módulo hay 20 preguntas. Necesitas alcanzar el 80% para considerar certificado ese módulo.
        </InfoCard>
        <InfoCard icon={CheckCircle2} title="7. Marcar completado">
          Cuando termines una lección, márcala como completada. El progreso queda guardado localmente en esta máquina.
        </InfoCard>
        <InfoCard icon={Search} title="8. Buscar contenido">
          Usa el buscador superior para encontrar módulos, lecciones o conceptos específicos dentro del curso.
        </InfoCard>
        <InfoCard icon={BookOpenCheck} title="9. Usar la vista visual">
          La vista visual muestra todos los módulos con imágenes y progreso para explorar el curso de manera más rápida.
        </InfoCard>
      </div>
    </div>
  );
}
