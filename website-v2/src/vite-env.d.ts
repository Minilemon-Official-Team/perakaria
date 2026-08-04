/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_API_URL?: string;
  readonly VITE_CMS_PREVIEW_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}