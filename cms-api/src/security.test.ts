import { describe, expect, it } from "vitest";
import { contrastRatio } from "./security";

describe("theme security", () => {
  it("accepts the default high contrast palette", () => {
    expect(contrastRatio("#15161B", "#FFFFFF")).toBeGreaterThan(10);
  });

  it("detects a low contrast pair", () => {
    expect(contrastRatio("#15161B", "#202126")).toBeLessThan(4.5);
  });
});
