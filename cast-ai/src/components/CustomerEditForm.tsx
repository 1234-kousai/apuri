import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'
import type { Customer } from '../lib/db'
import { validatePhoneNumber, validateLineId } from '../utils/format'

interface CustomerEditFormData {
  name: string
  birthday?: string
  phone?: string
  lineId?: string
  memo?: string
}

interface CustomerEditFormProps {
  customer: Customer
  onClose: () => void
}

export function CustomerEditForm({ customer, onClose }: CustomerEditFormProps) {
  const updateCustomer = useCustomerStore((state) => state.updateCustomer)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerEditFormData>({
    defaultValues: {
      name: customer.name,
      birthday: customer.birthday || '',
      phone: customer.phone || '',
      lineId: customer.lineId || '',
      memo: customer.memo || ''
    }
  })

  const onSubmit = async (data: CustomerEditFormData) => {
    try {
      await updateCustomer(customer.id!, {
        ...data,
        birthday: data.birthday || undefined,
        phone: data.phone || undefined,
        lineId: data.lineId || undefined,
        memo: data.memo || undefined
      })
      onClose()
    } catch (error) {
      console.error('Failed to update customer:', error)
      // エラーはstoreで処理されるため、ここでは何もしない
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">顧客情報編集</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前（ニックネーム）<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: '名前は必須です' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: ゆうきさん"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              誕生日
            </label>
            <input
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.birthday && (
              <p className="text-red-500 text-sm mt-1">{errors.birthday.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="090-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LINE ID
            </label>
            <input
              type="text"
              {...register('lineId', {
                validate: (value) => {
                  if (!value) return true
                  if (!validateLineId(value)) {
                    return 'LINE IDは4-20文字の英数字で入力してください'
                  }
                  return true
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="line_id_123"
            />
            {errors.lineId && (
              <p className="text-red-500 text-sm mt-1">{errors.lineId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              {...register('memo', {
                maxLength: {
                  value: 500,
                  message: 'メモは500文字以内で入力してください'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="好みや特徴など..."
            />
            {errors.memo && (
              <p className="text-red-500 text-sm mt-1">{errors.memo.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}