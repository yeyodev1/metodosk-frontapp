/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PAYPHONE_MODE: 'simulation' | 'live'
  readonly VITE_PAYPHONE_TOKEN: string
  readonly VITE_PAYPHONE_STORE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** Directiva de scroll reveal registrada en main.ts. */
    vReveal: import('vue').Directive<HTMLElement, number | undefined>
  }
}

export {}
