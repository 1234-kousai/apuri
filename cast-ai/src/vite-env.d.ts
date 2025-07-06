/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onRegisteredSW?: (swUrl: string, r: ServiceWorkerRegistration | undefined) => void
    onOfflineReady?: () => void
    onNeedRefresh?: () => void
    onUpdateFound?: () => void
    onRegisterError?: (error: any) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}
