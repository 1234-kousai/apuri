import { useState } from 'react'
import type { Customer, Visit } from '../lib/db'
import { useCustomerStore } from '../stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { PhoneIcon, CalendarIcon, StarIcon, EditIcon, Trash2Icon } from './ui/Icons'
import { formatCurrency, formatDate, formatDateShort, getRankColor } from '../utils/format'
import { showToast } from './Toast'
import { VisitEditForm } from './VisitEditForm'
import { getDecryptedString } from '../lib/customerDataUtils'

interface CustomerDetailProps {
  customer: Customer
  visits: Visit[]
  onClose: () => void
  onAddVisit: () => void
  onEdit: () => void
}

export function CustomerDetail({ customer, visits, onClose, onAddVisit, onEdit }: CustomerDetailProps) {
  console.log('=== CustomerDetail RENDER ===');
  console.log('Customer prop:', customer);
  console.log('Customer ID:', customer.id, 'Type:', typeof customer.id);
  console.log('Visits prop:', visits);
  console.log('Number of visits:', visits.length);
  
  const { deleteCustomer, deleteVisit } = useCustomerStore((state) => ({
    deleteCustomer: state.deleteCustomer,
    deleteVisit: state.deleteVisit
  }))
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [deletingVisitId, setDeletingVisitId] = useState<number | null>(null)
  
  const handleDelete = async () => {
    console.log('=== handleDelete START ===');
    console.log('Deleting customer:', customer);
    console.log('Customer ID:', customer.id);
    
    if (!customer.id) {
      console.error('Customer ID is undefined!');
      showToast('error', '顧客IDが見つかりません');
      return;
    }
    
    try {
      await deleteCustomer(customer.id)
      console.log('=== handleDelete SUCCESS ===');
      showToast('success', '顧客を削除しました')
      onClose()
    } catch (error) {
      console.error('=== handleDelete ERROR ===');
      console.error('Error details:', error)
      showToast('error', '削除に失敗しました')
    }
  }

  const handleDeleteVisit = async (visitId: number) => {
    console.log('=== handleDeleteVisit START ===');
    console.log('Visit ID to delete:', visitId);
    
    try {
      await deleteVisit(visitId)
      console.log('=== handleDeleteVisit SUCCESS ===');
      setDeletingVisitId(null)
    } catch (error) {
      console.error('=== handleDeleteVisit ERROR ===');
      console.error('Error details:', error)
    }
  }

  // 統計情報の計算
  const stats = {
    totalVisits: visits.length,
    averageSpending: visits.length > 0 ? customer.totalRevenue / visits.length : 0,
    lastVisitDays: customer.lastVisit 
      ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null,
    thisMonthRevenue: visits
      .filter(v => {
        const visitDate = new Date(v.date)
        const now = new Date()
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, v) => sum + v.revenue, 0)
  }

  return (
    <div className="fixed inset-0 bg-neutral-50 z-40 flex flex-col h-screen-safe">
      {/* ヘッダー */}
      <header className="bg-white border-b border-neutral-200 pt-safe">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">顧客詳細</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              削除
            </Button>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-safe">
          {/* プロフィール */}
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">{customer.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getRankColor(customer.vipRank)}`}>
                      <StarIcon size={12} filled className="sm:w-3.5 sm:h-3.5" />
                      {customer.vipRank.toUpperCase()}
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-600">
                      登録日: {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                    {formatCurrency(customer.totalRevenue)}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-500">累計売上</p>
                </div>
              </div>

              {/* 連絡先情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {customer.birthday && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <CakeIcon size={20} className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">誕生日</p>
                      <p className="font-medium">{formatDate(new Date(customer.birthday))}</p>
                    </div>
                  </div>
                )}
                
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <PhoneIcon size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">電話番号</p>
                      <a href={`tel:${getDecryptedString(customer.phone)}`} className="font-medium text-info hover:underline">
                        {getDecryptedString(customer.phone)}
                      </a>
                    </div>
                  </div>
                )}
                
                {customer.lineId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <MessageIcon size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">LINE ID</p>
                      <a 
                        href={`https://line.me/R/ti/p/${getDecryptedString(customer.lineId)}`} 
                        className="font-medium text-info hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getDecryptedString(customer.lineId)}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {customer.memo && (
                <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700 mb-1">メモ</p>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{getDecryptedString(customer.memo)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{stats.totalVisits}</p>
                <p className="text-sm text-neutral-500">来店回数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(stats.averageSpending)}
                </p>
                <p className="text-sm text-neutral-500">平均単価</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {customer.avgVisitInterval || '-'}
                  {customer.avgVisitInterval && <span className="text-base">日</span>}
                </p>
                <p className="text-sm text-neutral-500">平均来店間隔</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(stats.thisMonthRevenue)}
                </p>
                <p className="text-sm text-neutral-500">今月の売上</p>
              </CardContent>
            </Card>
          </div>

          {/* 来店履歴 */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>来店履歴</CardTitle>
              <Button
                size="sm"
                onClick={onAddVisit}
              >
                <PlusIcon size={16} className="mr-2" />
                来店追加
              </Button>
            </CardHeader>
            <CardContent>
              {visits.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">来店履歴がありません</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={onAddVisit}
                  >
                    最初の来店を記録
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {visits
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((visit, index) => (
                      <div key={visit.id} className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-sm font-medium">
                            {visits.length - index}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900">
                              {formatDate(visit.date)}
                              <span className="text-sm text-neutral-500 ml-2">
                                ({formatDateShort(visit.date)})
                              </span>
                            </p>
                            {visit.memo && (
                              <p className="text-sm text-neutral-600 mt-1">{visit.memo}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 ml-4">
                          <p className="text-lg font-bold text-primary-600">
                            {formatCurrency(visit.revenue)}
                          </p>
                          <button
                            onClick={() => setEditingVisit(visit)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-white rounded-lg transition-colors"
                            title="編集"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingVisitId(visit.id!)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2Icon size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="space-y-3">
            {(customer.phone || customer.lineId) && (
              <div className="grid grid-cols-2 gap-3">
                {customer.phone && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => window.location.href = `tel:${getDecryptedString(customer.phone)}`}
                  >
                    <PhoneIcon size={20} className="mr-2" />
                    電話をかける
                  </Button>
                )}
                {customer.lineId && (
                  <Button
                    variant="primary"
                    fullWidth
                    className="bg-success hover:bg-green-700"
                    onClick={() => window.open(`https://line.me/R/ti/p/${getDecryptedString(customer.lineId)}`, '_blank')}
                  >
                    <MessageIcon size={20} className="mr-2" />
                    LINEで連絡
                  </Button>
                )}
              </div>
            )}
            
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
            >
              この顧客を削除
            </Button>
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <AlertIcon size={24} className="text-error" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  本当に削除しますか？
                </h3>
                <p className="text-sm text-neutral-600">
                  {customer.name}さんのデータと全ての来店記録が削除されます。
                  この操作は取り消せません。
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleDelete}
                >
                  削除する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 来店記録編集モーダル */}
      {editingVisit && (
        <VisitEditForm
          visit={editingVisit}
          customerName={customer.name}
          onClose={() => setEditingVisit(null)}
          onSuccess={() => setEditingVisit(null)}
        />
      )}

      {/* 来店記録削除確認モーダル */}
      {deletingVisitId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <AlertIcon size={24} className="text-error" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  来店記録を削除しますか？
                </h3>
                <p className="text-sm text-neutral-600">
                  この操作は取り消せません。
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setDeletingVisitId(null)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleDeleteVisit(deletingVisitId)}
                >
                  削除する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function CakeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 16V8a1 1 0 00-1-1H10a1 1 0 00-1 1v8M3 16V8a1 1 0 011-1h1m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m10 9v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MessageIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}