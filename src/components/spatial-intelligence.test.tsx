import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpatialIntelligencePage } from "@/components/spatial-intelligence";

vi.mock("@/components/war-room", () => ({
  PageFrame: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("Kadamba Spatial Intelligence page", () => {
  beforeEach(() => {
    render(<SpatialIntelligencePage />);
  });

  it("renders all 25 measured pitch zones", () => {
    const grid = screen.getByRole("group", { name: "Prediction layer" });
    expect(grid).toBeTruthy();
    const zoneButtons = screen
      .getAllByRole("button")
      .filter((button) => /^Y[1-5], L[1-5]/.test(button.getAttribute("aria-label") ?? ""));
    expect(zoneButtons).toHaveLength(25);
  });

  it("switches between observed, context-only and context-plus-location layers", () => {
    const observed = screen.getByRole("button", { name: "Observed" });
    const context = screen.getByRole("button", { name: "Context" });
    const spatial = screen.getByRole("button", { name: "Context + location" });

    expect(spatial.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(context);
    expect(context.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(observed);
    expect(observed.getAttribute("aria-pressed")).toBe("true");
  });

  it("switches the mapped outcome between wickets and batter runs", () => {
    const runs = screen.getByRole("button", { name: "Expected runs" });
    const wickets = screen.getByRole("button", { name: "Wicket probability" });
    expect(wickets.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(runs);
    expect(runs.getAttribute("aria-pressed")).toBe("true");
    expect(wickets.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows a small-sample warning when a sparse zone is selected", () => {
    fireEvent.click(screen.getByRole("button", { name: /^Y1, L5/ }));
    expect(screen.getByRole("heading", { name: "Y1 / L5" })).toBeTruthy();
    expect(screen.getByText(/Small zone sample/)).toBeTruthy();
  });

  it("keeps the spatial pilot separate from live or player-specific claims", () => {
    expect(screen.getByText(/not a live next-ball forecast/)).toBeTruthy();
    expect(
      screen.getByText(
        /does not feed IPL pressure rankings, RR recruitment ranks or Match-State recommendations/,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Colour is re-scaled within the active view/)).toBeTruthy();
    expect(screen.getByText(/ball speed, which is only known after release/)).toBeTruthy();
    expect(screen.getByText(/uncalibrated model estimates/)).toBeTruthy();
  });
});
