import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ModuleCertificateData } from "@/lib/module-certificate";

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const NAVY = rgb(0.025, 0.067, 0.122);
const PANEL = rgb(0.055, 0.105, 0.17);
const SKY = rgb(0.49, 0.83, 0.98);
const WHITE = rgb(0.97, 0.985, 1);
const MUTED = rgb(0.72, 0.78, 0.85);

export async function createModuleCertificatePdf(data: ModuleCertificateData) {
  const document = await PDFDocument.create();
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);

  document.setTitle(`Certificado de aprobación - ${data.moduleTitle}`);
  document.setAuthor(data.issuer);
  document.setSubject(`Aprobación del Módulo ${data.moduleOrder}`);
  document.setKeywords(["inteligencia artificial", "educación", "certificado", "NotebookLM"]);

  drawBackground(page);
  drawHeader(page, bold);
  drawCenteredText(page, "CERTIFICADO DE APROBACIÓN", bold, 25, 476, WHITE);
  drawCenteredText(page, `MÓDULO ${data.moduleOrder}`, bold, 12, 447, SKY);
  drawCenteredWrappedText(page, data.moduleTitle, bold, 23, 416, 650, 28, WHITE);
  drawCenteredText(page, "OTORGADO A", bold, 9, 351, SKY);
  drawCenteredText(page, data.studentName, bold, 30, 311, WHITE);

  drawCenteredWrappedText(
    page,
    `Por completar el recorrido formativo y superar el examen final con ${data.score}%, demostrando comprensión y capacidad de aplicación de los contenidos del módulo.`,
    regular,
    11,
    270,
    650,
    16,
    MUTED,
  );

  drawMetric(page, 175, 186, "DURACIÓN", `${data.hours} horas estimadas`, bold, regular);
  drawMetric(page, 339, 186, "RESULTADO", `${data.score}% aprobado`, bold, regular);
  drawMetric(page, 503, 186, "FECHA", data.approvedAt, bold, regular);

  page.drawLine({
    start: { x: 154, y: 111 },
    end: { x: 354, y: 111 },
    thickness: 0.8,
    color: SKY,
    opacity: 0.7,
  });
  drawTextCenteredAt(page, data.issuer, bold, 11, 254, 94, WHITE);
  drawTextCenteredAt(page, "Certificación académica interna", regular, 8.5, 254, 79, MUTED);

  page.drawLine({
    start: { x: 488, y: 111 },
    end: { x: 688, y: 111 },
    thickness: 0.8,
    color: SKY,
    opacity: 0.7,
  });
  drawTextCenteredAt(page, `ID ${data.certificateId}`, bold, 9.5, 588, 94, WHITE);
  drawTextCenteredAt(page, "Validación interna del módulo", regular, 8.5, 588, 79, MUTED);

  drawCenteredText(
    page,
    `Producto formativo: ${data.product}`,
    regular,
    8.5,
    45,
    MUTED,
  );

  return document.save();
}

function drawBackground(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: NAVY });

  for (let x = 28; x < PAGE_WIDTH; x += 28) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: PAGE_HEIGHT },
      thickness: 0.35,
      color: WHITE,
      opacity: 0.045,
    });
  }
  for (let y = 28; y < PAGE_HEIGHT; y += 28) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: PAGE_WIDTH, y },
      thickness: 0.35,
      color: WHITE,
      opacity: 0.045,
    });
  }

  page.drawRectangle({
    x: 18,
    y: 18,
    width: PAGE_WIDTH - 36,
    height: PAGE_HEIGHT - 36,
    borderColor: SKY,
    borderWidth: 1,
    opacity: 0.75,
  });
  page.drawRectangle({
    x: 26,
    y: 26,
    width: PAGE_WIDTH - 52,
    height: PAGE_HEIGHT - 52,
    borderColor: WHITE,
    borderWidth: 0.4,
    opacity: 0.2,
  });

  drawCircuit(page, 18, PAGE_HEIGHT - 66, 1);
  drawCircuit(page, PAGE_WIDTH - 18, 66, -1);
  drawConstellation(page, 690, 445);
  drawConstellation(page, 92, 102);
}

function drawCircuit(page: PDFPage, originX: number, originY: number, direction: 1 | -1) {
  const paths = [
    [0, 0, 86, 0, 112, -26, 178, -26],
    [0, -16, 54, -16, 78, -40, 145, -40],
    [0, -32, 30, -32, 56, -58, 108, -58],
  ];

  for (const [x1, y1, x2, y2, x3, y3, x4, y4] of paths) {
    page.drawLine({
      start: { x: originX + x1 * direction, y: originY + y1 },
      end: { x: originX + x2 * direction, y: originY + y2 },
      thickness: 1.2,
      color: SKY,
      opacity: 0.55,
    });
    page.drawLine({
      start: { x: originX + x2 * direction, y: originY + y2 },
      end: { x: originX + x3 * direction, y: originY + y3 },
      thickness: 1.2,
      color: SKY,
      opacity: 0.55,
    });
    page.drawLine({
      start: { x: originX + x3 * direction, y: originY + y3 },
      end: { x: originX + x4 * direction, y: originY + y4 },
      thickness: 1.2,
      color: SKY,
      opacity: 0.55,
    });
    page.drawCircle({
      x: originX + x4 * direction,
      y: originY + y4,
      size: 3,
      color: SKY,
      opacity: 0.85,
    });
  }
}

function drawConstellation(page: PDFPage, originX: number, originY: number) {
  const nodes = [
    [0, 0],
    [38, 22],
    [82, 4],
    [116, 35],
    [143, 9],
    [28, -42],
    [74, -28],
    [125, -51],
  ];
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 2],
    [6, 7],
    [7, 4],
  ];

  for (const [from, to] of connections) {
    page.drawLine({
      start: { x: originX + nodes[from][0], y: originY + nodes[from][1] },
      end: { x: originX + nodes[to][0], y: originY + nodes[to][1] },
      thickness: 0.65,
      color: SKY,
      opacity: 0.28,
    });
  }

  nodes.forEach(([x, y], index) => {
    page.drawCircle({
      x: originX + x,
      y: originY + y,
      size: index % 3 === 0 ? 3.2 : 2,
      color: SKY,
      opacity: index % 3 === 0 ? 0.9 : 0.55,
    });
  });
}

function drawHeader(page: PDFPage, bold: PDFFont) {
  page.drawRectangle({ x: 54, y: 516, width: 42, height: 42, color: SKY });
  drawTextCenteredAt(page, "IA", bold, 15, 75, 530, NAVY);
  page.drawText("ACADEMIA IA", { x: 108, y: 540, size: 13, font: bold, color: WHITE });
  page.drawText("LA REVOLUCIÓN DEL CONOCIMIENTO", {
    x: 108,
    y: 525,
    size: 7.5,
    font: bold,
    color: SKY,
  });
}

function drawMetric(
  page: PDFPage,
  x: number,
  y: number,
  label: string,
  value: string,
  bold: PDFFont,
  regular: PDFFont,
) {
  page.drawRectangle({
    x,
    y,
    width: 150,
    height: 55,
    color: PANEL,
    borderColor: SKY,
    borderWidth: 0.6,
    opacity: 0.95,
  });
  drawTextCenteredAt(page, label, bold, 7.5, x + 75, y + 35, SKY);
  drawTextCenteredAt(page, value, regular, 10.5, x + 75, y + 16, WHITE);
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color: ReturnType<typeof rgb>,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y,
    size,
    font,
    color,
  });
}

function drawTextCenteredAt(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  centerX: number,
  y: number,
  color: ReturnType<typeof rgb>,
) {
  page.drawText(text, {
    x: centerX - font.widthOfTextAtSize(text, size) / 2,
    y,
    size,
    font,
    color,
  });
}

function drawCenteredWrappedText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color: ReturnType<typeof rgb>,
) {
  const lines = wrapText(text, font, size, maxWidth);
  lines.forEach((line, index) => {
    drawCenteredText(page, line, font, size, y - index * lineHeight, color);
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  return lines;
}
