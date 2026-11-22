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
  }) => select({ location: { pathname: "/squad" } }),
}));

import { SquadWorkbenchPage } from "@/components/squad-workbench";

describe("SquadWorkbenchPage React render", () => {
  it("renders the squad workbench without runtime errors", () => {
    render(<SquadWorkbenchPage />);

    expect(screen.getByText(/Build the squad/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose the starting XI/i)).toBeInTheDocument();
    expect(screen.getByText(/One Core Playing XI & Retained Bench/i)).toBeInTheDocument();
    expect(screen.getByText(/Definitive 11-Player Starting XI/i)).toBeInTheDocument();
  });

  it("renders the exact partition of all 19 retained players between XI and bench", () => {
    render(<SquadWorkbenchPage />);

    // Retained depth / bench heading
    expect(
      screen.getByText(/Retained Squad Depth & Bench \(8 Players Outside XI\)/i),
    ).toBeInTheDocument();
    // Frontline starters in the locked 11
    expect(screen.getAllByText("Yashasvi Jaiswal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Vaibhav Sooryavanshi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Riyan Parag").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dhruv Jurel").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ravi Bishnoi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mohammed Shami").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Jofra Archer").length).toBeGreaterThanOrEqual(1);
  });

  it("renders injury resilience stress testing without crashing", () => {
    render(<SquadWorkbenchPage />);

    expect(screen.getByText("03 · Injury resilience")).toBeInTheDocument();
    expect(screen.getByText("What if a core player is unavailable?")).toBeInTheDocument();
    expect(screen.getByText("Role-cover assessment")).toBeInTheDocument();
  });
});
