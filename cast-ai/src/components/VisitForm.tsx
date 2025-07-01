import { useForm } from 'react-hook-form'
import { useCustomerStore } from '../stores/customerStore'
import { Customer } from '../lib/db'

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VisitFormData>({
    defaultValues: {
      customerId: preSelectedCustomerId?.toString() || '',
      date: new Date().toISOString().split('T')[0]
    }
  })

  const onSubmit = async (data: VisitFormData) => {
    try {
      await addVisit({
        customerId: parseInt(data.customerId),
        date: new Date(data.date),
        revenue: parseInt(data.revenue),
        memo: data.memo || undefined
      })
      onClose()
    } catch (error) {
      console.error('Failed to add visit:', error)
      alert('来店記録の追加に失敗しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">来店記録</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              顧客<span className="text-red-500">*</span>
            </label>
            <select
              {...register('customerId', { required: '顧客を選択してください' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              来店日<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('date', { required: '来店日は必須です' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              売上金額<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('revenue', { 
                required: '売上金額は必須です',
                min: { value: 0, message: '0以上の値を入力してください' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
            {errors.revenue && (
              <p className="text-red-500 text-sm mt-1">{errors.revenue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              {...register('memo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="シャンパン注文など..."
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
              {isSubmitting ? '記録中...' : '記録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}