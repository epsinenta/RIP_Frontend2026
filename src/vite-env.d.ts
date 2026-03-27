/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MINIO_PUBLIC_BASE?: string
  readonly VITE_FALLBACK_IMAGE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
