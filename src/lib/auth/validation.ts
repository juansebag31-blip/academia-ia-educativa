type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export function validateEmail(value: string): ValidationResult<string> {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Introduce un correo electrónico válido." };
  }
  return { ok: true, value: email };
}

export function validatePassword(value: string): ValidationResult<string> {
  if (value.length < 8) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  return { ok: true, value };
}

export function validateRegistration(input: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult<{
  displayName: string;
  email: string;
  password: string;
}> {
  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, message: "Introduce tu nombre." };
  }

  const email = validateEmail(input.email);
  if (!email.ok) return email;

  const password = validatePassword(input.password);
  if (!password.ok) return password;

  if (input.password !== input.confirmPassword) {
    return { ok: false, message: "Las contraseñas no coinciden." };
  }

  return {
    ok: true,
    value: { displayName, email: email.value, password: password.value },
  };
}
