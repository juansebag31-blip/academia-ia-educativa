import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "marketing" / "prompt-kit.json"
OUTPUT = ROOT / "output" / "pdf" / "kit-prompts-ia-educativa.pdf"

NAVY = colors.HexColor("#07091A")
BLUE = colors.HexColor("#336EFF")
MAGENTA = colors.HexColor("#F43CB0")
MUTED = colors.HexColor("#56607D")
PAPER = colors.HexColor("#F7F8FF")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D9DDED"))
    canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(20 * mm, 9 * mm, "Academia IA Educativa")
    canvas.drawRightString(190 * mm, 9 * mm, f"Página {doc.page}")
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#536FC9"))
    canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.setFillColor(colors.HexColor("#D8DEFF"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(20 * mm, 9 * mm, "Academia IA Educativa")
    canvas.drawRightString(190 * mm, 9 * mm, f"Página {doc.page}")
    canvas.restoreState()


def build_pdf():
    prompts = json.loads(CONTENT.read_text(encoding="utf-8"))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=34, leading=38, textColor=colors.white, alignment=TA_CENTER, spaceAfter=18)
    cover_copy = ParagraphStyle("CoverCopy", parent=styles["BodyText"], fontSize=14, leading=21, textColor=colors.HexColor("#D8DEFF"), alignment=TA_CENTER)
    category_style = ParagraphStyle("Category", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=NAVY, spaceAfter=10)
    prompt_title = ParagraphStyle("PromptTitle", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=BLUE, spaceBefore=8, spaceAfter=8)
    label = ParagraphStyle("Label", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=MAGENTA, spaceBefore=8, spaceAfter=3)
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10.5, leading=16, textColor=NAVY, spaceAfter=5)
    prompt_box = ParagraphStyle("PromptBox", parent=body, backColor=PAPER, borderColor=colors.HexColor("#D9DDED"), borderWidth=0.7, borderPadding=10, borderRadius=6, spaceAfter=10)

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=20 * mm, bottomMargin=22 * mm, title="Kit de prompts para docentes y estudiantes", author="Academia IA Educativa")
    story = [
        Spacer(1, 42 * mm),
        Paragraph("ACADEMIA/IA", ParagraphStyle("Brand", parent=title, fontSize=16, textColor=colors.HexColor("#9EB5FF"))),
        Paragraph("Kit de prompts para enseñar y estudiar con IA", title),
        Paragraph("20 plantillas prácticas para planificar, comprender, investigar y verificar sin delegar tu criterio.", cover_copy),
        Spacer(1, 30 * mm),
        Paragraph("Curso gratuito de inteligencia artificial y NotebookLM", cover_copy),
        PageBreak(),
        Paragraph("Cómo usar este kit", category_style),
        Paragraph("Reemplazá los campos entre corchetes, agregá contexto real y revisá siempre el resultado. Un buen prompt no convierte una respuesta en evidencia: conservá las fuentes, verificá datos y protegé información personal.", body),
        Spacer(1, 8 * mm),
    ]

    current_category = None
    for index, item in enumerate(prompts, start=1):
        if item["category"] != current_category:
            if current_category is not None:
                story.append(PageBreak())
            current_category = item["category"]
            story.append(Paragraph(current_category, category_style))
            story.append(Paragraph("Cinco prompts para trabajar con una intención clara y revisar el resultado.", body))
            story.append(Spacer(1, 4 * mm))
        story.extend([
            Paragraph(f"{index:02d}. {item['title']}", prompt_title),
            Paragraph("OBJETIVO", label),
            Paragraph(item["objective"], body),
            Paragraph("PROMPT", label),
            Paragraph(item["prompt"], prompt_box),
            Paragraph("CÓMO ADAPTARLO", label),
            Paragraph(item["adapt"], body),
            Spacer(1, 5 * mm),
        ])

    story.extend([
        PageBreak(),
        Paragraph("Tu criterio es parte del proceso", category_style),
        Paragraph("La IA puede ayudarte a explorar, ordenar y revisar. La responsabilidad por lo que enseñás, estudiás o publicás sigue siendo humana. Volvé a las fuentes, documentá decisiones y explicá cuándo usaste asistencia de IA.", body),
        Spacer(1, 12 * mm),
        Paragraph("Continuá aprendiendo gratis en Academia IA Educativa.", prompt_box),
    ])
    doc.build(story, onFirstPage=cover_page, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
