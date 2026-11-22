import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown;
  }) => select({ location: { pathname: "/knockouts" } }),
}));

import { PlayoffEvidencePage } from "@/components/playoff-evidence";

describe("PlayoffEvidencePage React render", () => {
  it("renders the playoff lessons and death-overs evidence", () => {
    render(<PlayoffEvidencePage />);

    expect(screen.getAllByText("Playoff evidence").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("What the playoffs")).toBeInTheDocument();
    expect(screen.getByText("01 · Seven-match record")).toBeInTheDocument();
    expect(screen.getByText("Keep the core intact.")).toBeInTheDocument();
  });
});
