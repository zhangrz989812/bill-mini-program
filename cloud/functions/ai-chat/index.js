const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function getCurrentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2))
}

async function getAllRecords(openid, month) {
  const pageSize = 100
  let skip = 0
  let all = []

  while (true) {
    const res = await db.collection('records')
      .where({
        _openid: openid,
        month
      })
      .skip(skip)
      .limit(pageSize)
      .get()

    const data = res.data || []
    all = all.concat(data)

    if (data.length < pageSize) {
      break
    }

    skip += pageSize
  }

  return all
}

function buildBillSummary(records, month) {
  const incomeRecords = records.filter(item => item.type === 'income')
  const expenseRecords = records.filter(item => item.type === 'expense')

  const totalIncome = incomeRecords.reduce((sum, item) => {
    return sum + Number(item.amount || 0)
  }, 0)

  const totalExpense = expenseRecords.reduce((sum, item) => {
    return sum + Number(item.amount || 0)
  }, 0)

  const categoryMap = {}
  const dailyMap = {}

  expenseRecords.forEach(item => {
    const amount = Number(item.amount || 0)
    const categoryName = item.categoryName || '其他'

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = {
        name: categoryName,
        amount: 0,
        count: 0
      }
    }

    categoryMap[categoryName].amount += amount
    categoryMap[categoryName].count += 1

    const day = item.date ? item.date.slice(5) : ''

    if (day) {
      if (!dailyMap[day]) {
        dailyMap[day] = {
          date: day,
          expense: 0
        }
      }

      dailyMap[day].expense += amount
    }
  })

  const categoryStats = Object.values(categoryMap)
    .map(item => {
      return {
        name: item.name,
        amount: toMoney(item.amount),
        count: item.count,
        percentage: totalExpense > 0
          ? Number((item.amount / totalExpense * 100).toFixed(1))
          : 0
      }
    })
    .sort((a, b) => b.amount - a.amount)

  const dailyStats = Object.values(dailyMap)
    .map(item => {
      return {
        date: item.date,
        expense: toMoney(item.expense)
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const recent7Days = dailyStats.slice(-7)

  const topExpenses = expenseRecords
    .slice()
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5)
    .map(item => {
      return {
        date: item.date,
        categoryName: item.categoryName || '其他',
        amount: toMoney(item.amount),
        remark: item.remark || ''
      }
    })

  return {
    month,
    totalIncome: toMoney(totalIncome),
    totalExpense: toMoney(totalExpense),
    balance: toMoney(totalIncome - totalExpense),
    recordCount: records.length,
    categoryStats,
    recent7Days,
    topExpenses
  }
}

function buildMessages(userMessage, summary) {
  const categoryText = summary.categoryStats.length
    ? summary.categoryStats.map(item => {
      return `- ${item.name}：${item.amount} 元，占比 ${item.percentage}%，${item.count} 笔`
    }).join('\n')
    : '暂无分类支出数据'

  const recent7DaysText = summary.recent7Days.length
    ? summary.recent7Days.map(item => {
      return `- ${item.date}：${item.expense} 元`
    }).join('\n')
    : '暂无最近7天支出数据'

  const topExpensesText = summary.topExpenses.length
    ? summary.topExpenses.map(item => {
      return `- ${item.date}，${item.categoryName}，${item.amount} 元，备注：${item.remark || '无'}`
    }).join('\n')
    : '暂无大额支出数据'

  return [
    {
      role: 'system',
      content: [
        '你是一个个人记账小程序里的 AI 账单分析助手。',
        '',
        '规则：',
        '1. 只能基于系统提供的账单摘要回答。',
        '2. 不得编造不存在的金额、日期、分类、交易和备注。',
        '3. 如果数据不足，直接说明数据不足。',
        '4. 不要说你直接访问了数据库。',
        '5. 不要输出数据库字段名。',
        '6. 回答要具体，不要只说"理性消费""合理规划"。',
        '7. 如果用户问省钱建议，要结合具体分类和金额给建议。',
        '8. 回答使用中文，语气自然、简洁。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        `用户问题：${userMessage}`,
        '',
        '本月账单摘要：',
        `月份：${summary.month}`,
        `总收入：${summary.totalIncome} 元`,
        `总支出：${summary.totalExpense} 元`,
        `结余：${summary.balance} 元`,
        `账单笔数：${summary.recordCount}`,
        '',
        '分类支出：',
        categoryText,
        '',
        '最近7天支出：',
        recent7DaysText,
        '',
        '本月大额支出 Top5：',
        topExpensesText,
        '',
        '请基于以上账单摘要回答用户问题。'
      ].join('\n')
    }
  ]
}

async function callDeepSeek(messages) {
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
  const apiKey = process.env.DEEPSEEK_API_KEY
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  if (!apiKey) {
    throw new Error('未配置 DEEPSEEK_API_KEY')
  }

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`

  const res = await axios.post(
    url,
    {
      model,
      messages,
      stream: false,
      temperature: 0.3,
      max_tokens: 1200
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000
    }
  )

  if (
    !res.data ||
    !res.data.choices ||
    !res.data.choices[0] ||
    !res.data.choices[0].message ||
    !res.data.choices[0].message.content
  ) {
    throw new Error('DeepSeek 返回格式异常')
  }

  return res.data.choices[0].message.content
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const message = (event.message || '').trim()

  if (!message) {
    return {
      success: false,
      reply: '问题不能为空',
      message: '问题不能为空'
    }
  }

  try {
    const month = getCurrentMonth()
    const records = await getAllRecords(openid, month)
    const summary = buildBillSummary(records, month)
    const messages = buildMessages(message, summary)
    const reply = await callDeepSeek(messages)

    return {
      success: true,
      reply,
      summary
    }
  } catch (error) {
    console.error('ai-chat error:', error)

    return {
      success: false,
      reply: 'AI 分析失败，请检查 DeepSeek API 配置或稍后再试。',
      message: error.message
    }
  }
}
