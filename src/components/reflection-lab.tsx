"use client";

import { useEffect, useState } from "react";
import { FileUp, Lightbulb, Plus, Save, Trash2 } from "lucide-react";

type Reflection = {
  id: string;
  title: string;
  body: string;
  fileName?: string;
  createdAt: string;
};

const storageKey = "academia-ia-reflections";

export function ReflectionLab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState<Reflection[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setItems(JSON.parse(saved) as Reflection[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  function saveReflection() {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle && !cleanBody && !fileName) {
      return;
    }

    setItems((current) => [
      {
        id: crypto.randomUUID(),
        title: cleanTitle || "Reflexión sin título",
        body: cleanBody,
        fileName: fileName || undefined,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setTitle("");
    setBody("");
    setFileName("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-ember">
            <Lightbulb size={22} />
          </span>
          <div>
            <h2 className="text-xl font-black">Nueva reflexión</h2>
            <p className="text-sm text-slate-500">Ideas, preguntas, conexiones o creatividad aplicada.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Título</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line-soft px-4 py-3 text-sm outline-none focus:border-blue-300"
              placeholder="Ej: Idea para aplicar NotebookLM en mi estudio"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Reflexión</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-2 min-h-44 w-full resize-y rounded-xl border border-line-soft px-4 py-3 text-sm leading-6 outline-none focus:border-blue-300"
              placeholder="Escribe una idea, una duda, una conexión con tu trabajo o una forma creativa de usar IA..."
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm font-bold text-ember">
            <FileUp size={18} />
            <span>{fileName || "Adjuntar referencia o archivo"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            />
          </label>
          <button
            type="button"
            onClick={saveReflection}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white transition hover:bg-ember-dark"
          >
            <Save size={18} />
            Guardar reflexión
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Bitácora creativa</h2>
            <p className="mt-1 text-sm text-slate-500">Guardada localmente en este navegador.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{items.length} entradas</span>
        </div>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-soft bg-slate-50 p-8 text-center">
              <Plus className="mx-auto text-ember" size={28} />
              <p className="mt-3 text-sm font-bold text-slate-700">Todavía no hay reflexiones guardadas.</p>
              <p className="mt-1 text-sm text-slate-500">Usa este espacio para capturar ideas mientras estudias.</p>
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-line-soft bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black text-ink">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-ember"
                    aria-label="Eliminar reflexión"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                {item.body ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p> : null}
                {item.fileName ? <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600">Archivo asociado: {item.fileName}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

