import type { ContentStatus, Role } from "@perakaria/content-schema";
export const canEditEntry = (role:Role,userId:string,ownerId:string,status:ContentStatus) => role === "superadmin" ? status !== "archived" : userId === ownerId && ["draft","rejected","published"].includes(status);
export const canRunWorkflow = (role:Role,action:string,status:ContentStatus,isOwner:boolean) => {
  if(action === "submit-review") return isOwner && ["draft","rejected"].includes(status);
  if(action === "publish") return role === "superadmin" && ["draft","rejected","pending_review"].includes(status);
  if(role !== "superadmin") return false;
  if(action === "approve" || action === "reject") return status === "pending_review";
  if(action === "archive") return status === "published";
  return false;
};
export const validateUpload = (mime:string,size:number,altText:string) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const videoTypes = ["video/mp4", "video/webm"];
  const isImage = imageTypes.includes(mime);
  const isVideo = videoTypes.includes(mime);
  if (!isImage && !isVideo) return {ok:false,status:415,error:"Format harus JPEG, PNG, WebP, AVIF, MP4, atau WebM."} as const;
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (size > maxSize) return {ok:false,status:413,error:`Ukuran file maksimal ${isVideo ? "100 MB" : "10 MB"}.`} as const;
  if (!altText.trim()) return {ok:false,status:400,error:"Deskripsi/alt text wajib diisi."} as const;
  return {ok:true, kind: isVideo ? "video" : "image"} as const;
};
export const normalizeFileName = (name:string) => name.toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-|-$/g,"") || "asset";
