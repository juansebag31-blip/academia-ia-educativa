import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./landing-page";

describe("marketing landing", () => {
  it("renders the value proposition, evidence and real course links", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Aprendé inteligencia artificial/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("11 módulos progresivos")).toBeInTheDocument();
    expect(screen.getByText("33 lecciones prácticas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Empezar el curso gratis/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Explorar los 11 módulos/i })).toHaveAttribute("href", "/modules");
  });
});
