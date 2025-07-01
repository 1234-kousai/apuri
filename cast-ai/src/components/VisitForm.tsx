import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'
import type { Customer } from '../lib/db'
import { Input, Textarea, FormField } from './ui/Input'
import { Button } from './ui/Button'
import { CloseIcon } from './ui/Icons'
import { showToast } from './Toast'
import { formatCurrency } from '../utils/format'

interface VisitFormData {
  customerId: string
  date: string
  revenue: string
  memo?: string
}

interface VisitFormProps {
  customers: Customer[]
  preSelectedCustomerId?: number
  onClose: () => void
}

export function VisitForm({ customers, preSelectedCustomerId, onClose }: VisitFormProps) {
  const addVisit = useCustomerStore((state) => state.addVisit)
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<VisitFormData>({
    defaultValues: {
      customerId: preSelectedCustomerId?.toString() || '',
      date: new Date().toISOString().split('T')[0]
    }
  })
  
  const watchedFields = watch()
  const selectedCustomer = customers.find(c => c.id?.toString() === watchedFields.customerId)

  const onSubmit = async (data: VisitFormData) => {
    try {
      await addVisit({
        customerId: parseInt(data.customerId),
        date: new Date(data.date),
        revenue: parseInt(data.revenue),
        memo: data.memo || undefined
      })
      showToast('success', '来店記録を追加しました')
      onClose()
    } catch (error) {
      console.error('Failed to add visit:', error)
      showToast('error', '来店記録の追加に失敗しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end sm:justify-center z-50 animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg h-full sm:h-auto sm:rounded-xl shadow-xl flex flex-col animate-slide-up sm:animate-scale-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">来店記録</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        
        {/* フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* 顧客選択 */}
            <FormField
              label="顧客"
              error={errors.customerId?.message}
              required
            >
              <div className="relative">
                <select
                  {...register('customerId', { required: '顧客を選択してください' })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200
                    disabled:bg-neutral-50 disabled:text-neutral-500 appearance-none pr-10"
                >
                  <option value="">選択してください</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon size={20} className="text-neutral-400" />
                </div>
              </div>
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    <strong>{selectedCustomer.name}</strong>さん
                    {selectedCustomer.lastVisit && (
                      <span className="text-xs ml-2">
                        最終来店: {new Date(selectedCustomer.lastVisit).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </FormField>

            {/* 来店日 */}
            <FormField
              label="来店日"
              error={errors.date?.message}
              required
            >
              <Input
                type="date"
                {...register('date', { 
                  required: '来店日は必須です',
                  validate: (value) => {
                    const date = new Date(value)
                    const today = new Date()
                    if (date > today) return '未来の日付は選択できません'
                    return true
                  }
                })}
                max={new Date().toISOString().split('T')[0]}
                error={!!errors.date}
              />
              {watchedFields.date && (
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(watchedFields.date).toLocaleDateString('ja-JP', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </FormField>

            {/* 売上金額 */}
            <FormField
              label="売上金額"
              error={errors.revenue?.message}
              required
            >
              <div className="relative">
                <Input
                  type="number"
                  {...register('revenue', { 
                    required: '売上金額は必須です',
                    min: { value: 0, message: '0以上の値を入力してください' },
                    max: { value: 10000000, message: '金額が大きすぎます' }
                  })}
                  placeholder="10000"
                  error={!!errors.revenue}
                  className="pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">¥</span>
              </div>
              {watchedFields.revenue && parseInt(watchedFields.revenue) > 0 && (
                <p className="text-sm text-neutral-600 mt-1">
                  {formatCurrency(parseInt(watchedFields.revenue))}
                </p>
              )}
            </FormField>

            {/* メモ */}
            <FormField
              label="メモ"
              error={errors.memo?.message}
            >
              <Textarea
                {...register('memo', {
                  maxLength: {
                    value: 200,
                    message: 'メモは200文字以内で入力してください'
                  }
                })}
                rows={3}
                placeholder="シャンパン注文、VIPルーム利用など..."
                error={!!errors.memo}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-neutral-500">
                  来店時の詳細を記録
                </p>
                <p className="text-xs text-neutral-500">
                  {watchedFields.memo?.length || 0}/200
                </p>
              </div>
            </FormField>

            {/* クイック金額ボタン */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">クイック入力</p>
              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 20000, 30000, 50000, 100000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[name="revenue"]') as HTMLInputElement
                      if (input) {
                        input.value = amount.toString()
                        input.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    }}
                    className="px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={!watchedFields.customerId || !watchedFields.date || !watchedFields.revenue}
            >
              記録する
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChevronDownIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
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
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}