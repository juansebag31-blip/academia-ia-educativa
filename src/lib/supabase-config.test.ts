import { describe, expect, it } from "vitest";
import { readSupabasePublicConfig } from "./supabase-config";

describe("readSupabasePublicConfig", () => {
  it("returns null when Supabase is not configured during the transition", () => {
    expect(readSupabasePublicConfig({})).toBeNull();
  });

  it("returns the public configuration when both values exist", () => {
    expect(
      readSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it("rejects a partially configured environment", () => {
    expect(() =>
      readSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase configuration is incomplete");
  });
});
