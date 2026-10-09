import "server-only";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createAnonymousSessionId,
  createRagSubjectHash,
  type RagAssistantIdentity,
} from "./assistant-protection";

const RAG_ANONYMOUS_SESSION_COOKIE = "rag_visitor_session";
const ANONYMOUS_SESSION_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

function requestNetworkSignal(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  const candidate = forwarded.split(",")[0]?.trim().slice(0, 128);
  return candidate || "unknown";
}

export async function resolveRagAssistantIdentity(
  request: Request,
  secret: string,
): Promise<RagAssistantIdentity> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user?.id) {
      return {
        subjectType: "authenticated",
        subjectHash: createRagSubjectHash(secret, "authenticated", data.user.id),
      };
    }
  }

  const cookieStore = await cookies();
  const currentSession = cookieStore.get(RAG_ANONYMOUS_SESSION_COOKIE)?.value;
  const sessionId = currentSession && ANONYMOUS_SESSION_PATTERN.test(currentSession)
    ? currentSession
    : createAnonymousSessionId();

  if (sessionId !== currentSession) {
    cookieStore.set(RAG_ANONYMOUS_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  // The raw network signal and cookie are never persisted. Only this HMAC is stored.
  const anonymousSubject = `${sessionId}:${requestNetworkSignal(request)}`;
  return {
    subjectType: "anonymous",
    subjectHash: createRagSubjectHash(secret, "anonymous", anonymousSubject),
  };
}
