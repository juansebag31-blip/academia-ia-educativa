"use client";

import { useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import type { VideoResource } from "@/lib/course";

export function VideoPlayer({ video, compact = false }: { video: VideoResource; compact?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [posterSrc, setPosterSrc] = useState(video.thumbnailUrl);
  const embedParams = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  });
  if (video.startSeconds) embedParams.set("start", String(video.startSeconds));
  const embedSrc = loaded ? `${video.embedUrl}?${embedParams.toString()}` : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-card">
      <div className="relative aspect-video bg-black">
        {loaded ? (
          <iframe
            className="h-full w-full"
            src={embedSrc}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setLoaded(true)} className="group h-full w-full text-left" aria-label={`Reproducir ${video.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterSrc}
              alt=""
              className="h-full w-full object-cover opacity-80 transition group-hover:scale-[1.02] group-hover:opacity-95"
              onError={() => setPosterSrc(video.posterSrc)}
            />
            <span className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ember text-white shadow-2xl shadow-blue-950/40 transition group-hover:scale-105">
              <PlayCircle size={42} />
            </span>
            <span className="absolute bottom-4 left-4 right-4 text-sm font-bold text-white sm:text-base">Tocar para reproducir dentro del curso</span>
          </button>
        )}
      </div>
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-200">
          <span className="inline-flex items-center gap-1">
            <PlayCircle size={15} />
            Video recomendado
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1">{video.channel}</span>
        </div>
        <h3 className="mt-2 text-lg font-black leading-tight">{video.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{video.reason}</p>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
        >
          Abrir en YouTube
          <ExternalLink size={16} />
        </a>
      </div>
    </section>
  );
}

