import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { XIPlayerRail } from "@/components/xi-player-rail";
import type { DecisionPlayer } from "@/domain/rr-decision-engine";

const makePlayer = (name: string, overseas = false): DecisionPlayer => ({
  name,
  nationality: overseas ? "Overseas" : "Indian",
  overseas,
  role: "Middle-order batter",
  primaryRole: "Middle-order batter",
  isRetained: true,
});
const players = Array.from({ length: 11 }, (_, index) => ({
  position: index + 1,
  player: makePlayer(`Player ${index + 1}`, index === 10),
}));

describe("XIPlayerRail", () => {
  it("shows exactly eleven selected starters and no permanent Impact Player slot", () => {
    render(<XIPlayerRail players={players} />);
    expect(screen.getByRole("region", { name: "Starting XI, eleven players" })).toBeInTheDocument();
    for (let index = 1; index <= 11; index += 1)
      expect(screen.getByText(`Player ${index}`)).toBeInTheDocument();
    expect(screen.queryByText("Impact Player")).not.toBeInTheDocument();
    expect(screen.getByText("11/11 selected")).toBeInTheDocument();
  });
  it("explains that optimiser positions are not a fixed batting order", () => {
    render(<XIPlayerRail players={players} />);
    expect(screen.getByText(/not a fixed batting order/i)).toBeInTheDocument();
  });
});
