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
  }) => select({ location: { pathname: "/sources" } }),
}));

import { SourcesPage } from "@/components/sources";

describe("SourcesPage React render", () => {
  it("renders the sources and methods page", () => {
    render(<SourcesPage />);

    expect(screen.getByText(/Every decision should have a trail\./i)).toBeInTheDocument();
    expect(screen.getByText("Model provenance & validation boundaries")).toBeInTheDocument();
    expect(screen.getByText("Source register")).toBeInTheDocument();
  });

  it("lists important source entries and models", () => {
    render(<SourcesPage />);

    expect(screen.getByText("IPL Pressure Rankings")).toBeInTheDocument();
    expect(screen.getByText("Kadamba 25-zone model")).toBeInTheDocument();
  });
});
