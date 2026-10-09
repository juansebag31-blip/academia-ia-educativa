import type { RagAssistantErrorCode } from "./public-contract";

export class RagAssistantProtectionError extends Error {
  constructor(
    readonly publicCode: Extract<
      RagAssistantErrorCode,
      | "anonymous_daily_limit"
      | "authenticated_daily_limit"
      | "burst_limit"
      | "global_capacity"
    >,
    readonly httpStatus: number,
  ) {
    super(publicCode);
    this.name = "RagAssistantProtectionError";
  }
}
