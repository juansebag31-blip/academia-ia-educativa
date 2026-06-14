import { describe, expect, it } from "vitest";
import {
  getOptimizedDocumentSrc,
  getOptimizedImageSrc,
  getOptimizedVideoSrc,
} from "./course-assets";

describe("course asset delivery", () => {
  it("maps course PNG and JPEG images to versioned WebP display assets", () => {
    expect(getOptimizedImageSrc("/course-assets/modules/module-01/visuals/mapa.png")).toBe(
      "/course-assets-optimized/modules/module-01/visuals/mapa.png.webp",
    );
    expect(getOptimizedImageSrc("/course-assets/images/module-01.jpg")).toBe(
      "/course-assets-optimized/images/module-01.jpg.webp",
    );
  });

  it("leaves non-image and external paths unchanged", () => {
    expect(getOptimizedImageSrc("/course-assets/pdfs/module.pdf")).toBe(
      "/course-assets/pdfs/module.pdf",
    );
    expect(getOptimizedImageSrc("https://img.youtube.com/example.jpg")).toBe(
      "https://img.youtube.com/example.jpg",
    );
  });

  it("maps course PDFs to versioned delivery paths", () => {
    expect(getOptimizedDocumentSrc("/course-assets/pdfs/module.pdf")).toBe(
      "/course-assets-optimized/pdfs/module.pdf",
    );
    expect(getOptimizedDocumentSrc("https://example.com/module.pdf")).toBe(
      "https://example.com/module.pdf",
    );
  });

  it("maps course MP4 videos to versioned delivery paths", () => {
    expect(getOptimizedVideoSrc("/course-assets/modules/module-01/media/video.mp4")).toBe(
      "/course-assets-optimized/modules/module-01/media/video.mp4",
    );
    expect(getOptimizedVideoSrc("https://youtube.com/watch?v=example")).toBe(
      "https://youtube.com/watch?v=example",
    );
  });
});
