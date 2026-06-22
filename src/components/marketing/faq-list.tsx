"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqList({ items }: { items: FaqItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="mt-10 space-y-3">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        return (
          <article key={item.question} className="overflow-hidden rounded-2xl border border-white/10 bg-neural-panel">
            <h3>
              <button
                id={questionId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(index)}
                className="focus-ring flex w-full items-center justify-between gap-5 rounded-2xl px-5 py-5 text-left font-bold text-white"
              >
                <span>{item.question}</span>
                {isOpen ? <Minus className="shrink-0 text-blue-300" size={19} aria-hidden="true" /> : <Plus className="shrink-0 text-blue-300" size={19} aria-hidden="true" />}
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              hidden={!isOpen}
              className="border-t border-white/10 px-5 py-5 leading-7 text-slate-300"
            >
              {item.answer}
            </div>
          </article>
        );
      })}
    </div>
  );
}
