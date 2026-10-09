import "server-only";
import { answerRagAssistantQuestion, isRagAssistantApiEnabled } from "@/lib/rag/assistant-runtime";
import {
  assistantNotAvailableResponse,
  handleAssistantRequest,
} from "@/lib/rag/assistant-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isRagAssistantApiEnabled()) return assistantNotAvailableResponse();
  return handleAssistantRequest(request, { answerQuestion: answerRagAssistantQuestion });
}

export function GET(request: Request) {
  return handleAssistantRequest(request, { answerQuestion: answerRagAssistantQuestion });
}
