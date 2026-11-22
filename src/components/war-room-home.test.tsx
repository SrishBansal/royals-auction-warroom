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
  }) => select({ location: { pathname: "/" } }),
}));

import { WarRoomHomePage } from "@/components/war-room-home";

describe("WarRoomHomePage React render", () => {
  it("renders the home dashboard and narrative workflow", () => {
    render(<WarRoomHomePage />);

    expect(screen.getAllByText("War room").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Turn the next playoff return into a")).toBeInTheDocument();
    expect(screen.getByText("2027 retained squad snapshot")).toBeInTheDocument();
    expect(screen.getAllByText("19").length).toBeGreaterThanOrEqual(1); // 19 retained players
  });

  it("links to all supporting decision workspaces", () => {
    render(<WarRoomHomePage />);

    expect(screen.getAllByText("Squad & XI").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Recruitment").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Match state").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Kadamba zones").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IPL pressure ranks").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Sources & methods").length).toBeGreaterThanOrEqual(1);
  });
});
