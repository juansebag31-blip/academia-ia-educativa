import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { verifyDownloadToken } from "@/lib/marketing/download-token";

export async function GET(request: Request) {
  const secret = process.env.MARKETING_DOWNLOAD_SECRET?.trim();
  const token = new URL(request.url).searchParams.get("token");
  if (!secret || !token || !verifyDownloadToken(token, secret)) {
    return new Response("Enlace inválido o vencido.", { status: 403 });
  }

  try {
    const pdf = await readFile(join(process.cwd(), "output", "pdf", "kit-prompts-ia-educativa.pdf"));
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="kit-prompts-ia-educativa.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("El recurso no está disponible temporalmente.", { status: 503 });
  }
}
