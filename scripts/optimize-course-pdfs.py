from pathlib import Path
import json
import shutil
import fitz

SOURCE_ROOT = Path("public/course-assets").resolve()
OUTPUT_ROOT = Path(".generated/course-assets-v2").resolve()


def normalized_text(document: fitz.Document) -> str:
    return "\n".join(" ".join(page.get_text().split()) for page in document)


pdfs = sorted(SOURCE_ROOT.rglob("*.pdf"))
accepted = 0
fallback = 0
source_bytes = 0
output_bytes = 0

for source in pdfs:
    relative = source.relative_to(SOURCE_ROOT)
    output = OUTPUT_ROOT / relative
    temporary = output.with_suffix(".candidate.pdf")
    output.parent.mkdir(parents=True, exist_ok=True)

    original = fitz.open(source)
    original_pages = original.page_count
    original_text = normalized_text(original)
    original_size = source.stat().st_size

    candidate = fitz.open(source)
    candidate.rewrite_images(
        dpi_threshold=180,
        dpi_target=150,
        quality=82,
        lossy=True,
        lossless=True,
        bitonal=True,
        color=True,
        gray=True,
    )
    candidate.save(
        temporary,
        garbage=4,
        clean=True,
        deflate=True,
        deflate_images=True,
        deflate_fonts=True,
        use_objstms=1,
        compression_effort=100,
    )
    candidate.close()

    optimized = fitz.open(temporary)
    equivalent = (
        optimized.page_count == original_pages
        and normalized_text(optimized) == original_text
    )
    optimized.close()
    original.close()

    candidate_size = temporary.stat().st_size
    if equivalent and candidate_size < original_size * 0.98:
        temporary.replace(output)
        accepted += 1
    else:
        temporary.unlink(missing_ok=True)
        shutil.copy2(source, output)
        fallback += 1

    source_bytes += original_size
    output_bytes += output.stat().st_size

print(
    json.dumps(
        {
            "files": len(pdfs),
            "optimized": accepted,
            "originalFallback": fallback,
            "sourceMiB": round(source_bytes / 1024 / 1024, 2),
            "outputMiB": round(output_bytes / 1024 / 1024, 2),
            "reductionPercent": round(100 - (output_bytes / source_bytes) * 100, 1),
        },
        indent=2,
    )
)
