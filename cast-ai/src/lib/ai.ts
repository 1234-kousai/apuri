import { Customer, Visit } from './db'

interface CustomerWithVisits {
  customer: Customer
  visits: Visit[]
}

interface ScoredCustomer extends CustomerWithVisits {
  priorityScore: number
  reason: string
}

// 優先度スコアを計算
export function calculatePriorityScore(
  customer: Customer,
  visits: Visit[]
): { score: number; reason: string } {
  const now = new Date()
  const scores: { value: number; reason: string }[] = []

  // 1. 最終来店からの経過日数スコア
  if (customer.lastVisit) {
    const daysSinceLastVisit = Math.floor(
      (now.getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (customer.avgVisitInterval && daysSinceLastVisit >= customer.avgVisitInterval) {
      const overdueRatio = daysSinceLastVisit / customer.avgVisitInterval
      scores.push({
        value: overdueRatio * 0.5,
        reason: `最終来店から${daysSinceLastVisit}日経過（通常は${customer.avgVisitInterval}日間隔）`
      })
    } else if (daysSinceLastVisit > 30) {
      scores.push({
        value: (daysSinceLastVisit / 30) * 0.3,
        reason: `最終来店から${daysSinceLastVisit}日経過`
      })
    }
  } else {
    scores.push({
      value: 0.5,
      reason: '初回来店待ち'
    })
  }

  // 2. 誕生日ボーナス
  if (customer.birthday) {
    const birthday = new Date(customer.birthday)
    const thisYearBirthday = new Date(
      now.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    )
    
    // 今年の誕生日が過ぎていたら来年の誕生日を計算
    if (thisYearBirthday < now) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1)
    }
    
    const daysUntilBirthday = Math.floor(
      (thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysUntilBirthday <= 7) {
      scores.push({
        value: (8 - daysUntilBirthday) * 0.1,
        reason: `誕生日まであと${daysUntilBirthday}日です`
      })
    }
  }

  // 3. 売上ランクスコア
  const rankScore = customer.vipRank === 'gold' ? 0.3 : 
                   customer.vipRank === 'silver' ? 0.2 : 0.1
  scores.push({
    value: rankScore,
    reason: `${customer.vipRank.toUpperCase()}ランクのお客様`
  })

  // 4. 来店頻度の変化（直近の傾向）
  if (visits.length >= 3) {
    const recentVisits = visits
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    
    // 最近の来店間隔の平均
    const intervals: number[] = []
    for (let i = 1; i < recentVisits.length; i++) {
      const interval = Math.floor(
        (new Date(recentVisits[i - 1].date).getTime() - 
         new Date(recentVisits[i].date).getTime()) / (1000 * 60 * 60 * 24)
      )
      intervals.push(interval)
    }
    
    const recentAvgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    
    if (customer.avgVisitInterval && recentAvgInterval > customer.avgVisitInterval * 1.5) {
      scores.push({
        value: 0.2,
        reason: '最近の来店頻度が下がっています'
      })
    }
  }

  // 最も高いスコアとその理由を返す
  const highestScore = scores.reduce((max, current) => 
    current.value > max.value ? current : max
  )

  const totalScore = scores.reduce((sum, s) => sum + s.value, 0)

  return {
    score: Math.min(totalScore, 1), // 最大1.0に制限
    reason: highestScore.reason
  }
}

// サプライズ枠の候補を選出
export function getSurpriseCandidate(
  customersWithVisits: CustomerWithVisits[]
): ScoredCustomer | null {
  const candidates: ScoredCustomer[] = []
  const now = new Date()

  for (const { customer, visits } of customersWithVisits) {
    // 1. 新規顧客（登録から30日以内で来店2回以下）
    const daysSinceCreated = Math.floor(
      (now.getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceCreated <= 30 && visits.length <= 2) {
      candidates.push({
        customer,
        visits,
        priorityScore: 0.8,
        reason: '新規のお客様です（関係構築のチャンス）'
      })
    }

    // 2. 休眠顧客（最終来店から60日以上）
    if (customer.lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (now.getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastVisit >= 60) {
        candidates.push({
          customer,
          visits,
          priorityScore: 0.7,
          reason: `${daysSinceLastVisit}日ぶりの再アプローチ`
        })
      }
    }

    // 3. ランクダウン顧客（先月と比較して来店頻度が50%以下）
    if (visits.length >= 2) {
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const twoMonthsAgo = new Date(now)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

      const lastMonthVisits = visits.filter(v => {
        const visitDate = new Date(v.date)
        return visitDate >= lastMonth && visitDate < now
      }).length

      const previousMonthVisits = visits.filter(v => {
        const visitDate = new Date(v.date)
        return visitDate >= twoMonthsAgo && visitDate < lastMonth
      }).length

      if (previousMonthVisits > 0 && lastMonthVisits <= previousMonthVisits * 0.5) {
        candidates.push({
          customer,
          visits,
          priorityScore: 0.9,
          reason: '先月より来店頻度が下がっています'
        })
      }
    }
  }

  // ランダムに1名選出
  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length)
    return candidates[randomIndex]
  }

  return null
}

// 今日の営業提案を生成
export function getTodaysSuggestions(
  customers: Customer[],
  allVisits: Visit[]
): ScoredCustomer[] {
  // 顧客ごとに訪問履歴をグループ化
  const customersWithVisits: CustomerWithVisits[] = customers.map(customer => ({
    customer,
    visits: allVisits.filter(v => v.customerId === customer.id)
  }))

  // 各顧客の優先度スコアを計算
  const scoredCustomers: ScoredCustomer[] = customersWithVisits.map(({ customer, visits }) => {
    const { score, reason } = calculatePriorityScore(customer, visits)
    return {
      customer,
      visits,
      priorityScore: score,
      reason
    }
  })

  // スコアの高い順にソート
  const sortedByScore = [...scoredCustomers].sort((a, b) => b.priorityScore - a.priorityScore)

  // 結果を格納する配列
  const suggestions: ScoredCustomer[] = []

  // 優先度の高い2名を選出
  suggestions.push(...sortedByScore.slice(0, 2))

  // サプライズ枠を選出（既に選ばれた顧客を除外）
  const selectedIds = new Set(suggestions.map(s => s.customer.id))
  const remainingCustomers = customersWithVisits.filter(
    c => !selectedIds.has(c.customer.id)
  )
  
  const surpriseCandidate = getSurpriseCandidate(remainingCustomers)
  if (surpriseCandidate) {
    suggestions.push(surpriseCandidate)
  } else if (sortedByScore.length > 2) {
    // サプライズ枠の候補がいない場合は、3番目に優先度の高い顧客を選出
    suggestions.push(sortedByScore[2])
  }

  return suggestions
}