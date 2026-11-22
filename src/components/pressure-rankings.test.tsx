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
  }) => select({ location: { pathname: "/pressure-rankings" } }),
}));

import { PressureRankingsPage } from "@/components/pressure-rankings";

describe("PressureRankingsPage React render", () => {
  it("renders the IPL pressure rankings page", () => {
    render(<PressureRankingsPage />);

    expect(screen.getByText(/IPL pressure\./i)).toBeInTheDocument();
    expect(screen.getByText(/The rank order is unstable\./i)).toBeInTheDocument();
  });

  it("displays both batter and bowler top 10 rankings", () => {
    render(<PressureRankingsPage />);

    expect(screen.getByText("Shreyas Iyer")).toBeInTheDocument();
    expect(screen.getByText("Sanju Samson")).toBeInTheDocument();
  });
});
