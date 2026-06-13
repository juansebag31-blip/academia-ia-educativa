import { NextResponse } from "next/server";
import { findModuleBySlug } from "@/lib/course";
import { courseSeed } from "@/lib/course-seed";
import { getLatestExamAttempt } from "@/lib/exam-data";
import { buildModuleCertificateData } from "@/lib/module-certificate";
import { createModuleCertificatePdf } from "@/lib/module-certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleSlug: string }> },
) {
  const { moduleSlug } = await params;
  const courseModule = findModuleBySlug(courseSeed, moduleSlug);

  if (!courseModule) {
    return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 });
  }

  const latestAttempt = getLatestExamAttempt(moduleSlug);
  if (!latestAttempt?.passed || latestAttempt.percent < 80) {
    return NextResponse.json(
      { error: "Debes aprobar el examen con al menos 80% antes de descargar el certificado." },
      { status: 403 },
    );
  }

  const certificate = buildModuleCertificateData(courseModule, latestAttempt);
  const pdf = await createModuleCertificatePdf(certificate);
  const filename = `certificado-aprobacion-modulo-${courseModule.order}-academia-ia.pdf`;

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
