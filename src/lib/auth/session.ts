import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  initials: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? "";
  const displayName =
    typeof user.user_metadata.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : email.split("@")[0] || "Estudiante";

  return {
    id: user.id,
    email,
    displayName,
    initials: getInitials(displayName),
  };
}

export function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IA";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
