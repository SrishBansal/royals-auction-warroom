import { fireEvent, render, screen, within } from "@testing-library/react";
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
  }) => select({ location: { pathname: "/targets" } }),
}));

import { RecruitmentWorkbenchPage } from "@/components/recruitment-workbench";

describe("RecruitmentWorkbenchPage", () => {
  it("distinguishes the 20-player recruitment shortlist from the 89-name release register", () => {
    render(<RecruitmentWorkbenchPage />);

    expect(screen.getByText("Inspect all 20 researched profiles.")).toBeInTheDocument();
    expect(
      screen.getByText("These are research targets, not a confirmed auction list."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Of the 20 researched profiles, 0 are confirmed registered/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Browse the 89-name release register."));
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(90);
  });

  it("searches the supplied release register without treating reference names as selectable targets", () => {
    render(<RecruitmentWorkbenchPage />);
    fireEvent.click(screen.getByText("Browse the 89-name release register."));
    const search = screen.getByLabelText("Search the 89-name release reference");
    fireEvent.change(search, { target: { value: "MS Dhoni" } });

    const table = screen.getByRole("table");
    expect(within(table).getByText("MS Dhoni")).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("Retired as player · mentor role")).toBeInTheDocument();
  });
});
