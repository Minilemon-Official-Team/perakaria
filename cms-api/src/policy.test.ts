import { describe,expect,it } from "vitest";
import { canEditEntry,canRunWorkflow,normalizeFileName,validateUpload } from "./policy";
describe("CMS policy",()=>{
  it("prevents writers from approving or archiving",()=>{expect(canRunWorkflow("admin_writer","approve","pending_review",true)).toBe(false);expect(canRunWorkflow("admin_writer","archive","published",true)).toBe(false)});
  it("allows owned draft submission and superadmin approval",()=>{expect(canRunWorkflow("admin_writer","submit-review","draft",true)).toBe(true);expect(canRunWorkflow("superadmin","approve","pending_review",true)).toBe(true);expect(canRunWorkflow("superadmin","publish","draft",true)).toBe(true)});
  it("keeps ownership and status restrictions",()=>{expect(canEditEntry("admin_writer","a","b","draft")).toBe(false);expect(canEditEntry("admin_writer","a","a","published")).toBe(true);expect(canEditEntry("superadmin","a","b","archived")).toBe(false)});
  it("rejects illegal uploads",()=>{expect(validateUpload("image/gif",100,"alt").status).toBe(415);expect(validateUpload("image/png",11_000_000,"alt").status).toBe(413);expect(validateUpload("video/mp4",100,"video").kind).toBe("video");expect(validateUpload("image/png",100," ").status).toBe(400);expect(normalizeFileName("My Hero @2x.PNG")).toBe("my-hero-2x.png")});
});
