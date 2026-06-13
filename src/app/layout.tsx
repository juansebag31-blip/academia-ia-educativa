import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Academia IA Educativa",
  description: "Curso gratuito de inteligencia artificial aplicada a la educación con NotebookLM.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="es">
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}

