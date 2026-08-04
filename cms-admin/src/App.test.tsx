// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(URL, "createObjectURL", { value: () => "blob:perakaria-test", configurable: true });
});
afterEach(cleanup);

const enterDemo = () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /buka demo lokal/i }));
};

describe("Perakaria CMS v3", () => {
  it("edits and saves a hero draft locally", () => {
    enterDemo();
    fireEvent.click(screen.getAllByRole("button", { name: /home content/i })[0]);
    fireEvent.change(screen.getByLabelText("Deskripsi hero"), { target: { value: "Headline dari CMS" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan draft/i }));
    expect(localStorage.getItem("perakaria-cms-draft")).toContain("Headline dari CMS");
  });

  it("keeps services visible and supports adding a service", () => {
    enterDemo();
    fireEvent.click(screen.getAllByRole("button", { name: /^services$/i })[0]);
    expect(screen.getByText("Audio Visual Production")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /tambah service/i }));
    expect(screen.getByDisplayValue("Service baru")).toBeTruthy();
  });

  it("exposes all nine contact image slots in home content", () => {
    enterDemo();
    fireEvent.click(screen.getAllByRole("button", { name: /home content/i })[0]);
    expect(screen.getAllByText(/GRID 0[1-9]/i)).toHaveLength(9);
  });

  it("opens the media library workflow", () => {
    enterDemo();
    fireEvent.click(screen.getAllByRole("button", { name: /upload media/i })[0]);
    expect(screen.getByRole("heading", { name: /media library/i })).toBeTruthy();
    expect(screen.getByText(/upload sekali/i)).toBeTruthy();
  });
  it("shows the guarded publish action in demo mode", () => {
    enterDemo();
    fireEvent.click(screen.getAllByRole("button", { name: /home content/i })[0]);
    fireEvent.change(screen.getByLabelText("Deskripsi hero"), { target: { value: "Needs publish" } });
    fireEvent.click(screen.getByRole("button", { name: /publish ke website/i }));
    expect(screen.getByText(/mode demo tidak mempublish production/i)).toBeTruthy();
  });
});


