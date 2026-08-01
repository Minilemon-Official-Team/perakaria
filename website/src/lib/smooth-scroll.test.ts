// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { headerOffsetForWidth, scrollToHash, smoothScrollEasing } from "./smooth-scroll";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("smooth section navigation", () => {
  it("uses the fixed header height at each responsive breakpoint", () => {
    expect(headerOffsetForWidth(1440)).toBe(76);
    expect(headerOffsetForWidth(640)).toBe(66);
    expect(headerOffsetForWidth(390)).toBe(66);
  });

  it("jumps immediately when CMS motion is disabled", () => {
    const target = document.createElement("section");
    target.id = "about";
    target.getBoundingClientRect = () => ({
      top: 500,
      bottom: 600,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
    document.body.append(target);
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 1440, configurable: true });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    expect(scrollToHash("#about", { motionEnabled: false })).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 424, left: 0 });
  });
  it("eases quickly before settling at the exact destination", () => {
    expect(smoothScrollEasing(0)).toBe(0);
    expect(smoothScrollEasing(0.5)).toBeGreaterThan(0.95);
    expect(smoothScrollEasing(1)).toBe(1);
  });
});