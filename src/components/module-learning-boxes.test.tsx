import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ActiveLearningPanel } from "@/components/active-learning-panel";
import { courseSeed } from "@/lib/course-seed";

describe("collapsible learning boxes", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it.each(courseSeed.modules.map((courseModule) => [courseModule.title, courseModule] as const))(
    "renders nine collapsible step boxes for %s",
    (_title, courseModule) => {
      const { unmount } = render(<ActiveLearningPanel courseModule={courseModule} />);

      expect(screen.getAllByRole("button", { name: /Paso \d:/ })).toHaveLength(9);
      expect(screen.getByRole("button", { name: /Paso 1:/ })).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("region", { name: /Contenido del paso 1/ })).not.toBeInTheDocument();

      unmount();
    },
  );

  it("opens one step at a time and can close the active step", () => {
    render(<ActiveLearningPanel courseModule={courseSeed.modules[0]} />);

    const step1 = screen.getByRole("button", { name: /Paso 1:/ });
    const step2 = screen.getByRole("button", { name: /Paso 2:/ });

    fireEvent.click(step2);
    expect(step1).toHaveAttribute("aria-expanded", "false");
    expect(step2).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);

    fireEvent.click(step2);
    expect(step2).toHaveAttribute("aria-expanded", "false");
  });

  it("stores each module progress independently", () => {
    const courseModule = courseSeed.modules[1];
    render(<ActiveLearningPanel courseModule={courseModule} />);

    fireEvent.click(screen.getByRole("button", { name: /Paso 2:/ }));
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "Apunte propio del módulo 2" },
    });

    expect(window.localStorage.getItem(`academia-ia-active-learning-${courseModule.slug}`)).toContain(
      "Apunte propio del módulo 2",
    );
  });
});
