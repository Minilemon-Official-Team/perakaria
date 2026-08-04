// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(cleanup);

describe("Perakaria V2 landing page", () => {
  it("renders all five sections", () => {
    render(<App />);
    expect(screen.getByText("CREATIVE")).toBeTruthy();
    expect(screen.getByText("PRODUCTION")).toBeTruthy();
    expect(screen.getByText("PERAKARIA")).toBeTruthy();
    expect(screen.getByText("WHAT")).toBeTruthy();
    expect(screen.getByText("WE DO")).toBeTruthy();
    expect(screen.getByText("LET'S BUILD")).toBeTruthy();
    expect(screen.getByText("SOMETHING")).toBeTruthy();
  });

  it("exposes hero navigation links", () => {
    render(<App />);
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reel").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Contact").length).toBeGreaterThan(0);
  });


  it("locks page scroll while the mobile navigation is open", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("keeps the public surface free of internal labels", () => {
    render(<App />);
    expect(document.body.textContent).not.toMatch(/placeholder|cms|demo/i);
  });
});
