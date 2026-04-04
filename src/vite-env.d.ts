/// <reference types="vite/client" />

declare module "*.mp4" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_MINIO_PUBLIC_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
