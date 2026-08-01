// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
afterEach(cleanup);
Object.defineProperty(window,"matchMedia",{value:vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})});
describe("Perakaria public website",()=>{
  it("renders safe defaults and contact action",()=>{render(<App/>);expect(screen.getByRole("heading",{name:"Solusi Digital Inovatif, Eksekusi Visual Sinematik."})).toBeTruthy();expect(screen.getAllByRole("link",{name:/mulai percakapan/i}).length).toBeGreaterThan(0);expect(screen.queryByText("Lihat karya")).toBeNull()});
  it("opens mobile navigation and keeps only one capability expanded",async()=>{render(<App/>);const menu=screen.getAllByRole("button",{name:/menu/i})[0];fireEvent.click(menu);expect(menu.getAttribute("aria-expanded")).toBe("true");const first=screen.getByRole("button",{name:/Audio Visual Production/i});const next=screen.getByRole("button",{name:/Design & Branding/i});expect(first.getAttribute("aria-expanded")).toBe("true");fireEvent.click(next);await waitFor(()=>{expect(first.getAttribute("aria-expanded")).toBe("false");expect(next.getAttribute("aria-expanded")).toBe("true")})});
  it("reveals expertise detail through tap and exposes an accessible disclosure",()=>{render(<App/>);const skill=screen.getByRole("button",{name:/Video Production/i});expect(skill.getAttribute("aria-expanded")).toBe("false");fireEvent.click(skill);expect(skill.getAttribute("aria-expanded")).toBe("true");expect(screen.getByRole("region",{name:/Detail Video Production/i})).toBeTruthy()});
  it("accepts complete CMS preview payload",async()=>{render(<App/>);window.dispatchEvent(new MessageEvent("message",{data:{type:"perakaria:preview",content:{...structuredClone((await import("@perakaria/content-schema")).defaultSiteContent),hero:{...structuredClone((await import("@perakaria/content-schema")).defaultSiteContent.hero),headline:"Preview Draft Headline"}}}}));expect(await screen.findByRole("heading",{name:"Preview Draft Headline"})).toBeTruthy()});
  it("keeps the public surface free of internal content labels",()=>{render(<App/>);expect(document.body.textContent).not.toMatch(/placeholder|ilustrasi|cms|demo/i)});
});