/// <reference types="vite-plugin-pwa/client" />

declare module "*.mp4" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_MINIO_PUBLIC_BASE?: string;
  readonly VITE_DEV_API_PROXY?: string;
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
