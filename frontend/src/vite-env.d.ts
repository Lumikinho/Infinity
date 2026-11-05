/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend local usado pelo proxy do Vite em desenvolvimento. */
  readonly VITE_API_URL_LOCAL?: string
  /** URL pública da API usada no build de produção. */
  readonly VITE_API_URL_PUBLIC?: string
  /** Compatibilidade: alvo do proxy em desenvolvimento. */
  readonly VITE_PROXY_TARGET?: string
  /** Compatibilidade: base direta da API. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
