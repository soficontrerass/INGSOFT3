/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // añade otras VITE_... aquí si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}