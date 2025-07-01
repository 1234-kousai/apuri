import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    // PWAインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // iOSかチェック
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // iOS以外のブラウザでインストールプロンプトをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  if (isInstalled) {
    return null
  }

  if (isIOS && !showIOSPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <p className="text-sm mb-2">ホーム画面に追加して、アプリとして使えます</p>
        <button
          onClick={() => setShowIOSPrompt(true)}
          className="bg-white text-blue-500 px-4 py-2 rounded-md text-sm font-medium"
        >
          インストール方法を見る
        </button>
      </div>
    )
  }

  if (isIOS && showIOSPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">インストール方法</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>下部の共有ボタン 
                <svg className="inline w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0l-5.464 0" />
                </svg>
                をタップ</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>「ホーム画面に追加」を選択</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>右上の「追加」をタップ</span>
            </li>
          </ol>
          <button
            onClick={() => setShowIOSPrompt(false)}
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded-md"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  if (installPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <p className="text-sm mb-2">アプリとしてインストールできます</p>
        <button
          onClick={handleInstallClick}
          className="bg-white text-blue-500 px-4 py-2 rounded-md text-sm font-medium"
        >
          インストール
        </button>
      </div>
    )
  }

  return null
}