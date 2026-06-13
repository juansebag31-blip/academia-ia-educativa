import type { CourseModule } from "@/lib/course";

export type CertificateAttempt = {
  correct: number;
  total: number;
  percent: number;
  passed: number;
  created_at: string;
};

export type ModuleCertificateData = {
  studentName: string;
  moduleOrder: number;
  moduleTitle: string;
  modulePurpose: string;
  product: string;
  hours: number;
  score: number;
  approvedAt: string;
  certificateId: string;
  issuer: string;
};

const STUDENT_NAME = "Juan Sebastian González";
const STUDENT_INITIALS = "JSG";
const ISSUER = "Academia IA Educativa";
const CERTIFICATE_TIME_ZONE = "America/Argentina/Buenos_Aires";

export function buildModuleCertificateData(
  courseModule: CourseModule,
  attempt: CertificateAttempt,
): ModuleCertificateData {
  if (!attempt.passed || attempt.percent < 80) {
    throw new Error("El módulo todavía no está aprobado");
  }

  const approvedDate = new Date(attempt.created_at);
  const dateParts = getDateParts(approvedDate);

  return {
    studentName: STUDENT_NAME,
    moduleOrder: courseModule.order,
    moduleTitle: courseModule.title.replace(/^Módulo \d+ - /, ""),
    modulePurpose: courseModule.purpose,
    product: courseModule.product,
    hours: courseModule.certificateHours,
    score: attempt.percent,
    approvedAt: new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: CERTIFICATE_TIME_ZONE,
    }).format(approvedDate),
    certificateId: `AIA-M${String(courseModule.order).padStart(2, "0")}-${STUDENT_INITIALS}-${dateParts.year}${dateParts.month}${dateParts.day}`,
    issuer: ISSUER,
  };
}

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: CERTIFICATE_TIME_ZONE,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}
