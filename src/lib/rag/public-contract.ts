export const RAG_ASSISTANT_MAX_QUESTION_LENGTH = 1_200;

export type RagAnswerSource = {
  id: string;
  moduleNumber: number | null;
  moduleTitle: string | null;
  sectionTitle: string | null;
  subsectionTitle: string | null;
  pageStart: number;
  pageEnd: number;
  routePath: string | null;
  similarity: number;
};

export type GroundedRagAnswer = {
  status: "answered" | "insufficient_evidence";
  answer: string | null;
  sources: RagAnswerSource[];
};

export type RagAssistantRequest = {
  question: string;
  courseSlug: string;
  moduleSlug?: string | null;
};

export type RagAssistantErrorCode =
  | "invalid_request"
  | "method_not_allowed"
  | "not_available"
  | "anonymous_daily_limit"
  | "authenticated_daily_limit"
  | "burst_limit"
  | "global_capacity"
  | "quota_exceeded"
  | "request_timeout"
  | "temporarily_unavailable"
  | "internal_error";

export type RagAssistantErrorResponse = {
  error: {
    code: RagAssistantErrorCode;
    message: string;
  };
};

export type RagAssistantApiResponse = GroundedRagAnswer | RagAssistantErrorResponse;
