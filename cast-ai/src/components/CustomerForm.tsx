import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'
import { validatePhoneNumber, validateLineId } from '../utils/format'
import { validateSafeString, validateDate } from '../utils/validation'
import { Input, FormField } from './ui/Input'
import { UltraPremiumButton } from './ui/UltraPremiumButton'
import { FloatingInput, FloatingTextarea } from './ui/FloatingInput'
import { Modal } from './Modal'
import { BirthdayIcon, InfoIcon } from './ui/Icons'

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
    <Modal isOpen={true} onClose={onClose} title="新規顧客登録" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">
            {/* 名前 */}
            <FloatingInput
              label="名前（ニックネーム） *"
              error={errors.name?.message}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              {...register('name', { 
                required: '名前は必須です',
                maxLength: {
                  value: 50,
                  message: '名前は50文字以内で入力してください'
                },
                validate: (value) => {
                  const validation = validateSafeString(value, 50, '名前')
                  return validation.isValid || validation.error
                }
              })}
              autoFocus
              success={!errors.name && !!watchedFields.name}
            />

            {/* 誕生日 */}
            <FormField
              label="誕生日"
              error={errors.birthday?.message}
              htmlFor="customer-birthday"
            >
              <div className="relative">
                <Input
                  id="customer-birthday"
                  type="date"
                  {...register('birthday', {
                    validate: (value) => {
                      if (!value) return true
                      const validation = validateDate(value, undefined, new Date(), '誕生日')
                      return validation.isValid || validation.error
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
              htmlFor="customer-phone"
            >
              <Input
                id="customer-phone"
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
              htmlFor="customer-line-id"
            >
              <Input
                id="customer-line-id"
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
            <div>
              <FloatingTextarea
                label="メモ"
                error={errors.memo?.message}
                {...register('memo', {
                  maxLength: {
                    value: 500,
                    message: 'メモは500文字以内で入力してください'
                  },
                  validate: (value) => {
                    if (!value) return true
                    const validation = validateSafeString(value, 500, 'メモ')
                    return validation.isValid || validation.error
                  }
                })}
                rows={4}
                success={!errors.memo && !!watchedFields.memo && watchedFields.memo.length > 0}
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-neutral-500">
                  お客様の好みや特徴を記録
                </p>
                <p className="text-xs text-neutral-500">
                  {watchedFields.memo?.length || 0}/500
                </p>
              </div>
            </div>

            {/* 連絡先がない場合の警告 */}
            {!watchedFields.phone && !watchedFields.lineId && (
              <div className="panel-glass p-4 flex items-start gap-3 border-amber-200/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <InfoIcon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">連絡先の登録をおすすめします</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    電話番号またはLINE IDを登録しておくと、AIが提案した際にすぐ連絡できます
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50 flex gap-3 sticky bottom-0">
            <UltraPremiumButton
              type="button"
              variant="glass"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </UltraPremiumButton>
            <UltraPremiumButton
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={!watchedFields.name}
              glow
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              顧客を登録
            </UltraPremiumButton>
          </div>
        </form>
    </Modal>
  )
}