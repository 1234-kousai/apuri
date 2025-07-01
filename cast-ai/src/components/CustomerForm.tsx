import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerFormData>()

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await addCustomer({
        ...data,
        birthday: data.birthday || undefined
      })
      onClose()
    } catch (error) {
      console.error('Failed to add customer:', error)
      alert('顧客の追加に失敗しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">新規顧客登録</h2>
        
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
              {...register('birthday')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="090-1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LINE ID
            </label>
            <input
              type="text"
              {...register('lineId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="line_id_123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              {...register('memo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="好みや特徴など..."
            />
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
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}