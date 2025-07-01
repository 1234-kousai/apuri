import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'
import { validatePhoneNumber, validateLineId } from '../utils/format'
import { Input, Textarea, FormField } from './ui/Input'
import { Button } from './ui/Button'
import { CloseIcon } from './ui/Icons'

interface CustomerFormData {
  name: string
  birthday?: string
  phone?: string
  lineId?: string
  memo?: string
}

interface CustomerFormProps {
  onClose: () => void
}

export function CustomerForm({ onClose }: CustomerFormProps) {
  const addCustomer = useCustomerStore((state) => state.addCustomer)
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CustomerFormData>()
  
  const watchedFields = watch()

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await addCustomer({
        ...data,
        birthday: data.birthday || undefined
      })
      onClose()
    } catch (error) {
      console.error('Failed to add customer:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end sm:justify-center z-50 animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg h-full sm:h-auto sm:rounded-xl shadow-xl flex flex-col animate-slide-up sm:animate-scale-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">新規顧客登録</h2>
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
            {/* 名前 */}
            <FormField
              label="名前（ニックネーム）"
              error={errors.name?.message}
              required
            >
              <Input
                {...register('name', { 
                  required: '名前は必須です',
                  maxLength: {
                    value: 50,
                    message: '名前は50文字以内で入力してください'
                  }
                })}
                placeholder="例: ゆうきさん"
                error={!!errors.name}
                autoFocus
              />
            </FormField>

            {/* 誕生日 */}
            <FormField
              label="誕生日"
              error={errors.birthday?.message}
            >
              <div className="relative">
                <Input
                  type="date"
                  {...register('birthday', {
                    validate: (value) => {
                      if (!value) return true
                      const date = new Date(value)
                      const today = new Date()
                      if (date > today) return '未来の日付は選択できません'
                      return true
                    }
                  })}
                  max={new Date().toISOString().split('T')[0]}
                  error={!!errors.birthday}
                />
                {watchedFields.birthday && (
                  <div className="mt-2 text-sm text-neutral-600">
                    <BirthdayIcon size={16} className="inline mr-1" />
                    {(() => {
                      const birthday = new Date(watchedFields.birthday)
                      const today = new Date()
                      const age = today.getFullYear() - birthday.getFullYear()
                      const monthDiff = today.getMonth() - birthday.getMonth()
                      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate()) ? age - 1 : age
                      return `${adjustedAge}歳`
                    })()}
                  </div>
                )}
              </div>
            </FormField>

            {/* 電話番号 */}
            <FormField
              label="電話番号"
              error={errors.phone?.message}
            >
              <Input
                type="tel"
                {...register('phone', {
                  validate: (value) => {
                    if (!value) return true
                    if (!validatePhoneNumber(value)) {
                      return '正しい電話番号を入力してください（例: 090-1234-5678）'
                    }
                    return true
                  }
                })}
                placeholder="090-1234-5678"
                error={!!errors.phone}
              />
              <p className="text-xs text-neutral-500 mt-1">
                ハイフンあり・なし両方対応
              </p>
            </FormField>

            {/* LINE ID */}
            <FormField
              label="LINE ID"
              error={errors.lineId?.message}
            >
              <Input
                {...register('lineId', {
                  validate: (value) => {
                    if (!value) return true
                    if (!validateLineId(value)) {
                      return 'LINE IDは4-20文字の英数字で入力してください'
                    }
                    return true
                  }
                })}
                placeholder="line_id_123"
                error={!!errors.lineId}
              />
              <p className="text-xs text-neutral-500 mt-1">
                @マークは不要です
              </p>
            </FormField>

            {/* メモ */}
            <FormField
              label="メモ"
              error={errors.memo?.message}
            >
              <Textarea
                {...register('memo', {
                  maxLength: {
                    value: 500,
                    message: 'メモは500文字以内で入力してください'
                  }
                })}
                rows={4}
                placeholder="好みや特徴など..."
                error={!!errors.memo}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-neutral-500">
                  お客様の好みや特徴を記録
                </p>
                <p className="text-xs text-neutral-500">
                  {watchedFields.memo?.length || 0}/500
                </p>
              </div>
            </FormField>

            {/* 連絡先がない場合の警告 */}
            {!watchedFields.phone && !watchedFields.lineId && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
                <InfoIcon size={16} className="text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-700">
                  連絡先（電話番号またはLINE ID）を登録しておくと、AIが提案した際にすぐ連絡できます
                </p>
              </div>
            )}
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
              disabled={!watchedFields.name}
            >
              登録する
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BirthdayIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
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

function InfoIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="16"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="8"
        x2="12.01"
        y2="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}