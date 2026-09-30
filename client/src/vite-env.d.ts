/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端接口基础路径，默认 /api */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
