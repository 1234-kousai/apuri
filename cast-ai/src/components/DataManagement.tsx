import { useState, useEffect } from 'react'
import { exportData, importData } from '../lib/dataExport'
import { showToast } from './Toast'
import { useCustomerStore } from '../stores/customerStore'
import { DownloadIcon, UploadIcon, ClockIcon, Trash2Icon } from './ui/Icons'
import { 
  isAutoBackupEnabled, 
  setAutoBackupEnabled, 
  getLastBackupTime,
  getSavedBackups,
  deleteBackup,
  downloadBackup
} from '../lib/autoBackup'
import { formatDate } from '../utils/format'

export function DataManagement() {
  console.log('=== DataManagement RENDER ===');
  
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [autoBackup, setAutoBackup] = useState(isAutoBackupEnabled())
  const [lastBackup] = useState<Date | null>(getLastBackupTime())
  const [savedBackups, setSavedBackups] = useState<Array<{id: number; filename: string; timestamp: number; data: string}>>([])
  const [showBackups, setShowBackups] = useState(false)
  const { loadCustomers, loadVisits } = useCustomerStore()
  
  console.log('Auto backup enabled:', autoBackup);
  console.log('Last backup:', lastBackup);

  useEffect(() => {
    loadSavedBackups()
  }, [])

  const loadSavedBackups = async () => {
    const backups = await getSavedBackups()
    setSavedBackups(backups)
  }

  const handleAutoBackupToggle = () => {
    const newValue = !autoBackup
    setAutoBackupEnabled(newValue)
    setAutoBackup(newValue)
    showToast('success', `自動バックアップを${newValue ? '有効' : '無効'}にしました`)
  }

  const handleDeleteBackup = async (id: number) => {
    try {
      await deleteBackup(id)
      await loadSavedBackups()
      showToast('success', 'バックアップを削除しました')
    } catch (error) {
      showToast('error', 'バックアップの削除に失敗しました')
    }
  }

  const handleExport = async () => {
    console.log('=== handleExport START ===');
    setIsExporting(true)
    try {
      await exportData()
      console.log('=== handleExport SUCCESS ===');
      showToast('success', 'データをエクスポートしました')
    } catch (error: any) {
      console.error('=== handleExport ERROR ===');
      console.error('Error details:', error);
      showToast('error', error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('=== handleImport START ===');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setIsImporting(true)
    try {
      const result = await importData(file)
      console.log('Import result:', result);
      console.log('=== handleImport SUCCESS ===');
      showToast('success', `${result.customers}件の顧客と${result.visits}件の訪問記録をインポートしました`)
      
      // データを再読み込み
      console.log('Reloading data...');
      await loadCustomers()
      await loadVisits()
    } catch (error: any) {
      console.error('=== handleImport ERROR ===');
      console.error('Error details:', error);
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

        {/* 自動バックアップ */}
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] opacity-50 mb-3">自動バックアップ</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-sm">自動バックアップを有効にする</span>
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={handleAutoBackupToggle}
                className="ultra-checkbox"
              />
            </label>
            
            {lastBackup && (
              <div className="flex items-center gap-2 text-xs opacity-50">
                <ClockIcon size={14} />
                <span>最後のバックアップ: {formatDate(lastBackup)}</span>
              </div>
            )}
            
            <button
              onClick={() => setShowBackups(!showBackups)}
              className="text-xs text-[#00d4ff] hover:underline"
            >
              保存されたバックアップを表示 ({savedBackups.length}件)
            </button>
          </div>
        </div>

        {/* 保存されたバックアップ */}
        {showBackups && savedBackups.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] opacity-50 mb-3">保存されたバックアップ</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedBackups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm">{backup.filename}</p>
                    <p className="text-xs opacity-50">{formatDate(new Date(backup.timestamp))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadBackup(backup)}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="ダウンロード"
                    >
                      <DownloadIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="p-2 text-white/60 hover:text-red-400 transition-colors"
                      title="削除"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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