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
  }) => select({ location: { pathname: "/match-lab" } }),
}));

import { MatchLabPage } from "@/components/match-lab";

describe("MatchLabPage React render", () => {
  it("renders the match-state and Impact Player lab", () => {
    render(<MatchLabPage />);

    expect(screen.getByText("Match-state Lab")).toBeInTheDocument();
    expect(screen.getByText(/Change the situation/i)).toBeInTheDocument();
    expect(screen.getByText("01 · Select the match state")).toBeInTheDocument();
  });

  it("calculates one-for-one substitution candidate without twelfth slot", () => {
    render(<MatchLabPage />);

    expect(screen.getByText("04 · One-for-one Impact Player plan")).toBeInTheDocument();
    expect(screen.getByText(/Who comes in — and who makes way\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The Impact Player rule does not add a permanent twelfth player/i),
    ).toBeInTheDocument();
  });
});
