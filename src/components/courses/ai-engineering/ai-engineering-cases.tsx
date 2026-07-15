"use client";

import { useId, useState } from "react";
import type { AiEngineeringPreparedCase } from "@/lib/courses/types";
import { SanitizedHtml } from "./sanitized-html";

export function AiEngineeringCases({ cases }: { cases: AiEngineeringPreparedCase[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();

  function moveTab(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % cases.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + cases.length) % cases.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = cases.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setActiveIndex(nextIndex);
    document.getElementById(`${baseId}-tab-${nextIndex}`)?.focus();
  }

  return (
    <>
      <div className="hidden md:block">
        <div role="tablist" aria-label="Casos reales" className="grid grid-cols-3 gap-2">
          {cases.map((caseItem, index) => (
            <button
              key={caseItem.id}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => moveTab(event, index)}
              className="focus-ring rounded-xl border border-slate-300 px-4 py-3 text-left text-sm font-black text-slate-700 aria-selected:border-cyan-400 aria-selected:bg-cyan-50 aria-selected:text-cyan-900"
            >
              {caseItem.title}
            </button>
          ))}
        </div>
        {cases.map((caseItem, index) => (
          <div
            key={caseItem.id}
            id={`${baseId}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${index}`}
            hidden={activeIndex !== index}
            tabIndex={0}
            className="focus-ring mt-4 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <SanitizedHtml html={caseItem.html} />
          </div>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {cases.map((caseItem, index) => (
          <details key={caseItem.id} open={index === 0} className="group rounded-xl border border-slate-200 bg-white">
            <summary className="focus-ring cursor-pointer list-none rounded-xl px-4 py-4 font-black text-slate-800 marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {caseItem.title}
                <span aria-hidden="true" className="text-cyan-700 group-open:rotate-45 motion-reduce:transition-none">+</span>
              </span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <SanitizedHtml html={caseItem.html} />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
