import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FaqList } from "./faq-list";

it("links each FAQ button to its answer content", () => {
  render(<FaqList items={[{ question: "¿Es gratuito?", answer: "Sí, todo el curso es gratuito." }]} />);

  const button = screen.getByRole("button", { name: "¿Es gratuito?" });
  expect(button).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(button);

  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Sí, todo el curso es gratuito.")).toBeVisible();
});
