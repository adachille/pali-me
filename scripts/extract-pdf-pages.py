#!/usr/bin/env python3
"""Extract text from a PDF, writing each page to a separate .txt file in an output folder."""

import sys
from pathlib import Path

import fitz  # pymupdf


def extract_pages(pdf_path: Path, output_dir: Path) -> None:
    doc = fitz.open(str(pdf_path))
    page_count = doc.page_count
    pad = len(str(page_count))

    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Extracting {page_count} pages from {pdf_path.name} -> {output_dir}/")

    for i, page in enumerate(doc):
        text = page.get_text()
        page_file = output_dir / f"page-{str(i + 1).zfill(pad)}.txt"
        page_file.write_text(text, encoding="utf-8")

    doc.close()
    print(f"Done. {page_count} files written.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <input.pdf> [output_dir]")
        sys.exit(1)

    pdf = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else pdf.parent / pdf.stem
    extract_pages(pdf, output_dir)
