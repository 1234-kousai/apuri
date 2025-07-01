import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { CloseIcon } from './ui/Icons'
import type { AISuggestion } from '../lib/ai-enhanced'

interface AISettingsProps {
  onClose: () => void
  settings: {
    maxSuggestions: number
    includeCategories: AISuggestion['category'][]
    minScore: number
  }
  onSave: (settings: AISettingsProps['settings']) => void
}

export function AISettings({ onClose, settings, onSave }: AISettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  
  const categories: { 
    value: AISuggestion['category']
    label: string
    description: string
    icon: string
  }[] = [
    {
      value: 'urgent',
      label: '緊急',
      description: '離脱リスクの高い顧客への対応',
      icon: '🚨'
    },
    {
      value: 'opportunity',
      label: 'チャンス',
      description: '売上向上の機会がある顧客',
      icon: '💎'
    },
    {
      value: 'relationship',
      label: '関係構築',
      description: '定期的なコミュニケーション',
      icon: '🤝'
    },
    {
      value: 'surprise',
      label: 'サプライズ',
      description: '予期せぬ連絡で好印象を',
      icon: '🎉'
    }
  ]
  
  const handleCategoryToggle = (category: AISuggestion['category']) => {
    setLocalSettings(prev => ({
      ...prev,
      includeCategories: prev.includeCategories.includes(category)
        ? prev.includeCategories.filter(c => c !== category)
        : [...prev.includeCategories, category]
    }))
  }
  
  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <Card className="w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden rounded-t-xl sm:rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200">
          <CardTitle>AI提案設定</CardTitle>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <CloseIcon size={24} />
          </button>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 overflow-y-auto">
          {/* 提案数の設定 */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-2">最大提案数</h3>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              1日に表示する提案の最大数を設定します
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={localSettings.maxSuggestions}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  maxSuggestions: parseInt(e.target.value)
                }))}
                className="flex-1"
              />
              <span className="text-lg font-bold w-12 text-center">
                {localSettings.maxSuggestions}
              </span>
            </div>
          </div>
          
          {/* カテゴリー設定 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">提案カテゴリー</h3>
            <p className="text-sm text-neutral-600 mb-4">
              表示する提案のカテゴリーを選択します
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    localSettings.includeCategories.includes(category.value)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">{category.label}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                        {category.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      localSettings.includeCategories.includes(category.value)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-neutral-300'
                    }`}>
                      {localSettings.includeCategories.includes(category.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 最小スコア設定 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">最小信頼度スコア</h3>
            <p className="text-sm text-neutral-600 mb-4">
              この値以上の信頼度を持つ提案のみを表示します
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={localSettings.minScore * 100}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  minScore: parseInt(e.target.value) / 100
                }))}
                className="flex-1"
              />
              <span className="text-lg font-bold w-12 text-center">
                {Math.round(localSettings.minScore * 100)}%
              </span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-500">
              <span>低い（より多くの提案）</span>
              <span>高い（厳選された提案）</span>
            </div>
          </div>
          
          {/* プレビュー */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium mb-2">現在の設定</h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• 最大 {localSettings.maxSuggestions} 件の提案を表示</li>
              <li>• {localSettings.includeCategories.map(c => 
                categories.find(cat => cat.value === c)?.label
              ).join('、')} カテゴリーを含む</li>
              <li>• 信頼度 {Math.round(localSettings.minScore * 100)}% 以上の提案のみ</li>
            </ul>
          </div>
          
          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleSave}
            >
              設定を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}