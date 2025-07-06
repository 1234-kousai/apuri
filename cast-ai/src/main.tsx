import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/ultrathink.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { registerSW } from 'virtual:pwa-register'

// Service Worker登録
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl) {
      console.log('Service Worker registered:', swUrl)
    },
    onOfflineReady() {
      console.log('App is ready to work offline')
    },
    onNeedRefresh() {
      console.log('New content available, refresh needed')
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error)
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
