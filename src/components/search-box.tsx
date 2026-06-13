"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CourseSeed } from "@/lib/course";
import { searchCourseCatalog } from "@/lib/course";

export function SearchBox({ course }: { course: CourseSeed }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCourseCatalog(course, query), [course, query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-line-soft bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          className="focus-ring w-full bg-transparent text-sm outline-none"
          placeholder="Buscar módulos y lecciones..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {query.trim().length > 1 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">Sin resultados para esa búsqueda.</p>
          ) : (
            results.map((result) => (
              <Link
                href={result.href}
                key={`${result.type}-${result.href}`}
                className="block border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-blue-50"
                onClick={() => setQuery("")}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-ember">{result.type}</p>
                <p className="text-sm font-bold text-ink">{result.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{result.excerpt}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

