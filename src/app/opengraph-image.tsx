import { ImageResponse } from "next/og";

export const alt = "Academia IA Educativa: curso gratuito de IA y NotebookLM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "radial-gradient(circle at 82% 32%, #9c246f 0%, transparent 28%), linear-gradient(140deg, #07091a 0%, #111143 58%, #251037 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px 72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
          ACADEMIA<span style={{ color: "#789cff" }}>/IA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#9eb5ff", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Curso gratuito · IA + NotebookLM</div>
          <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 0.98, marginTop: 22, maxWidth: 930 }}>Aprendé inteligencia artificial. Enseñá y estudiá mejor.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, gap: 24 }}>
          <span>11 módulos</span><span style={{ color: "#ff62c3" }}>·</span><span>33 lecciones</span><span style={{ color: "#ff62c3" }}>·</span><span>100% gratuito</span>
        </div>
      </div>
    ),
    size,
  );
}
