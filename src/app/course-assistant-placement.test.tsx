import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AssistantChat } from "@/components/rag/assistant-chat";
import CoursePage from "./(app)/courses/[courseSlug]/page";
import ModulePage from "./(app)/courses/[courseSlug]/modules/[moduleSlug]/page";

type PageElement = ReactElement<{ children?: ReactNode }>;
type AssistantElement = ReactElement<{
  courseSlug: string;
  moduleSlug?: string | null;
}>;

function pageChildren(page: PageElement) {
  return Children.toArray(page.props.children).filter(isValidElement) as ReactElement[];
}

describe("course assistant placement", () => {
  it("renders exactly once before the module hero while preserving module context", async () => {
    const page = await ModulePage({
      params: Promise.resolve({
        courseSlug: "ia-educativa-notebooklm",
        moduleSlug: "modulo-6-notebooklm-desde-cero",
      }),
    });
    expect(isValidElement(page)).toBe(true);

    const children = pageChildren(page as PageElement);
    const assistants = children.filter((child) => child.type === AssistantChat);

    expect(assistants).toHaveLength(1);
    expect(children[0].type).toBe(AssistantChat);
    expect((children[0] as AssistantElement).props).toMatchObject({
      courseSlug: "ia-educativa-notebooklm",
      moduleSlug: "modulo-6-notebooklm-desde-cero",
    });
    expect(children[1].type).toBe("section");
  });

  it("renders the course-wide assistant as the first page section", async () => {
    const page = await CoursePage({
      params: Promise.resolve({ courseSlug: "ia-educativa-notebooklm" }),
    });
    expect(isValidElement(page)).toBe(true);

    const children = pageChildren(page as PageElement);
    const assistants = children.filter((child) => child.type === AssistantChat);

    expect(assistants).toHaveLength(1);
    expect(children[0].type).toBe(AssistantChat);
    expect((children[0] as AssistantElement).props).toMatchObject({ courseSlug: "ia-educativa-notebooklm" });
    expect((children[0] as AssistantElement).props.moduleSlug).toBeUndefined();
    expect(children[1].type).toBe("section");
  });
});
