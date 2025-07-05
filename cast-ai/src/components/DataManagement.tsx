import { useState } from 'react'
import { exportData, importData } from '../lib/dataExport'
import { showToast } from './Toast'
import { useCustomerStore } from '../stores/customerStore'
import { DownloadIcon, UploadIcon } from './ui/Icons'

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { loadCustomers, loadVisits } = useCustomerStore()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportData()
      showToast('success', 'データをエクスポートしました')
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const result = await importData(file)
      showToast('success', `${result.customers}件の顧客と${result.visits}件の訪問記録をインポートしました`)
      
      // データを再読み込み
      await loadCustomers()
      await loadVisits()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsImporting(false)
      // ファイル選択をリセット
      event.target.value = ''
    }
  }

  return (
    <div className="ultra-card p-8">
      <h2 className="text-2xl font-thin mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
        データ管理
      </h2>
      
      <div className="space-y-4">
        {/* エクスポート */}
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] opacity-50 mb-3">バックアップ</h3>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="ultra-btn w-full flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <div className="ultra-loading" />
            ) : (
              <>
                <DownloadIcon size={20} />
                <span>データをエクスポート</span>
              </>
            )}
          </button>
          <p className="text-xs opacity-50 mt-2">
            すべての顧客データと訪問記録をJSONファイルとして保存します
          </p>
        </div>

        {/* インポート */}
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] opacity-50 mb-3">復元</h3>
          <label className="ultra-btn w-full flex items-center justify-center gap-3 cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
            {isImporting ? (
              <div className="ultra-loading" />
            ) : (
              <>
                <UploadIcon size={20} />
                <span>データをインポート</span>
              </>
            )}
          </label>
          <p className="text-xs opacity-50 mt-2">
            以前エクスポートしたJSONファイルからデータを復元します
          </p>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#ff0080]/10 to-[#ff6b00]/10 border border-[#ff0080]/20">
          <p className="text-xs opacity-70 leading-relaxed">
            <strong className="text-[#ff0080]">注意:</strong> エクスポートされたファイルには暗号化されていない顧客情報が含まれます。安全な場所に保管してください。
          </p>
        </div>
      </div>
    </div>
  )
}