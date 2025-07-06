import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Visit } from '../lib/db'
import { useCustomerStore } from '../stores/customerStore'
import { Modal } from './ui/Modal'
import { Input, FormField } from './ui/Input'
import { Button } from './ui/Button'
import { escapeHtml } from '../utils/validation'
import { checkDuplicateVisit } from '../lib/dbUtils'
import { showToast } from './Toast'

interface VisitEditFormProps {
  visit: Visit
  customerName: string
  onClose: () => void
  onSuccess?: () => void
}

type FormData = {
  date: string
  revenue: number
  memo: string
}

export function VisitEditForm({ visit, customerName, onClose, onSuccess }: VisitEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateVisit = useCustomerStore((state) => state.updateVisit)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: new Date(visit.date).toISOString().split('T')[0],
      revenue: visit.revenue,
      memo: visit.memo || ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const visitDate = new Date(data.date)
      
      // 重複来店チェック（自分自身を除外）
      const isDuplicate = await checkDuplicateVisit(visit.customerId, visitDate, visit.id)
      if (isDuplicate) {
        showToast('error', 'この日付の来店記録は既に存在します')
        return
      }
      
      // 将来の日付チェック
      if (visitDate > new Date()) {
        showToast('error', '将来の日付は入力できません')
        return
      }
      
      await updateVisit(visit.id!, {
        date: visitDate,
        revenue: data.revenue,
        memo: data.memo ? escapeHtml(data.memo) : undefined
      })
      showToast('success', '来店記録を更新しました')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to update visit:', error)
      showToast('error', '来店記録の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="来店記録を編集" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            顧客: <span className="font-medium text-neutral-900">{customerName}</span>
          </p>
        </div>
        
        <FormField label="来店日" error={errors.date?.message} required>
          <Input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            error={!!errors.date}
            {...register('date', {
              required: '来店日を選択してください'
            })}
          />
        </FormField>

        <FormField label="売上金額" error={errors.revenue?.message} required>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            error={!!errors.revenue}
            {...register('revenue', {
              required: '売上金額を入力してください',
              min: { value: 0, message: '0以上の金額を入力してください' },
              valueAsNumber: true
            })}
          />
        </FormField>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            メモ
          </label>
          <textarea
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="特記事項があれば入力"
            {...register('memo', {
              maxLength: { value: 200, message: '200文字以内で入力してください' }
            })}
          />
          {errors.memo && (
            <p className="mt-1 text-sm text-error">{errors.memo.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
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
            disabled={isSubmitting}
          >
            {isSubmitting ? '更新中...' : '更新'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}