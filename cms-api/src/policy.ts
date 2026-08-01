import type { ContentStatus, Role } from "@perakaria/content-schema";
export const canEditEntry = (role:Role,userId:string,ownerId:string,status:ContentStatus) => role === "superadmin" ? status !== "archived" : userId === ownerId && ["draft","rejected","published"].includes(status);
export const canRunWorkflow = (role:Role,action:string,status:ContentStatus,isOwner:boolean) => {
  if(action === "submit-review") return isOwner && ["draft","rejected"].includes(status);
  if(role !== "superadmin") return false;
  if(action === "approve" || action === "reject") return status === "pending_review";
  if(action === "archive") return status === "published";
  return false;
};
export const validateUpload = (mime:string,size:number,altText:string) => {
  if(!["image/jpeg","image/png","image/webp"].includes(mime)) return {ok:false,status:415,error:"Format harus JPEG, PNG, atau WebP."} as const;
  if(size > 2*1024*1024) return {ok:false,status:413,error:"Ukuran file maksimal 2 MB."} as const;
  if(!altText.trim()) return {ok:false,status:400,error:"Alt text wajib diisi."} as const;
  return {ok:true} as const;
};
export const normalizeFileName = (name:string) => name.toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-|-$/g,"") || "asset";