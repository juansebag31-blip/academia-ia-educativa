type PromptKitEmail = {
  email: string;
  downloadUrl: string;
  unsubscribeUrl: string;
};

export async function sendPromptKitEmail(input: PromptKitEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.email],
        subject: "Tu kit de prompts de Academia IA",
        text: `Tu kit está listo: ${input.downloadUrl}\n\nPodés darte de baja aquí: ${input.unsubscribeUrl}`,
        html: `<h1>Tu kit de prompts está listo</h1><p><a href="${input.downloadUrl}">Descargar el kit</a></p><p><a href="${input.unsubscribeUrl}">Darme de baja</a></p>`,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
