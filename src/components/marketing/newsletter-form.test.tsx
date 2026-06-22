import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsletterForm } from "./newsletter-form";
import type { NewsletterActionState } from "@/lib/marketing/actions";

describe("newsletter form", () => {
  it("renders accessible data and consent fields", () => {
    render(<NewsletterForm />);

    expect(screen.getByLabelText("Nombre (opcional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeRequired();
    expect(screen.getByLabelText(/Acepto la política de privacidad/i)).toBeRequired();
    expect(document.querySelector('input[name="company"]')).toHaveAttribute("tabindex", "-1");
  });

  it("shows the signed download after a successful action", async () => {
    const action = async (): Promise<NewsletterActionState> => ({
      status: "success",
      downloadUrl: "/api/marketing/kit?token=signed",
      emailSent: false,
    });
    render(<NewsletterForm action={action} />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "docente@example.com" } });
    fireEvent.click(screen.getByLabelText(/Acepto la política de privacidad/i));
    fireEvent.submit(screen.getByRole("button", { name: /Quiero mi kit/i }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("link", { name: /Descargar el kit/i })).toHaveAttribute("href", "/api/marketing/kit?token=signed"));
  });
});
