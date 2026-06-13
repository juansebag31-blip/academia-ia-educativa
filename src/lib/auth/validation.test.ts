import { describe, expect, it } from "vitest";
import { validateEmail, validatePassword, validateRegistration } from "./validation";

describe("auth validation", () => {
  it("normalizes a valid email", () => {
    expect(validateEmail("  JUAN@example.com ")).toEqual({
      ok: true,
      value: "juan@example.com",
    });
  });

  it("rejects an invalid email", () => {
    expect(validateEmail("juan")).toEqual({
      ok: false,
      message: "Introduce un correo electrónico válido.",
    });
  });

  it("requires a password of at least eight characters", () => {
    expect(validatePassword("1234567")).toEqual({
      ok: false,
      message: "La contraseña debe tener al menos 8 caracteres.",
    });
  });

  it("requires matching passwords and a display name", () => {
    expect(
      validateRegistration({
        displayName: "",
        email: "juan@example.com",
        password: "12345678",
        confirmPassword: "87654321",
      }),
    ).toEqual({
      ok: false,
      message: "Introduce tu nombre.",
    });
  });
});
