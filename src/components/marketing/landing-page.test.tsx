import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./landing-page";

describe("marketing landing", () => {
  it("renders the value proposition, neural education visual and real course links", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Aprend/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/11.*progresivos/i)).toBeInTheDocument();
    expect(screen.getByText(/33.*pr/i)).toBeInTheDocument();
    expect(screen.getByTestId("marketing-hero-layout")).toHaveClass("lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]");
    expect(screen.getByRole("img", { name: /visual animado de inteligencia artificial aplicada a la educaci/i })).toBeInTheDocument();
    expect(screen.getByText(/Red neuronal educativa/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprendizaje con IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerebro circuito IA/i)).toBeInTheDocument();
    expect(screen.getByText(/fuentes.*estudio.*criterio/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Empezar el curso gratis/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Explorar los 11/i })).toHaveAttribute("href", "/modules");
  });
});
