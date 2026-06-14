import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DeferredAudio,
  DeferredDocument,
  DeferredVideo,
} from "./deferred-media";

describe("deferred media", () => {
  it("does not mount an audio source before playback is requested", () => {
    const { container } = render(
      <DeferredAudio src="/audio.m4a" type="audio/mp4" title="Audio de prueba" />,
    );

    expect(container.querySelector("audio")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reproducir Audio de prueba" }));
    expect(container.querySelector('audio source[src="/audio.m4a"]')).not.toBeNull();
  });

  it("does not mount a video source before playback is requested", () => {
    const { container } = render(
      <DeferredVideo
        src="/video.mp4"
        type="video/mp4"
        poster="/poster.webp"
        title="Video de prueba"
      />,
    );

    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reproducir Video de prueba" }));
    expect(container.querySelector('video source[src="/video.mp4"]')).not.toBeNull();
  });

  it("does not mount a PDF iframe before opening the viewer", () => {
    const { container } = render(
      <DeferredDocument src="/documento.pdf" title="Documento de prueba" />,
    );

    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cargar Documento de prueba" }));
    expect(container.querySelector('iframe[src="/documento.pdf#view=FitH"]')).not.toBeNull();
  });
});
