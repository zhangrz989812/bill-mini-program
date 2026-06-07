const cloud = require('wx-server-sdk')

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

function buildSummary(records, month) {
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

  records.forEach(item => {
    const day = item.date ? item.date.slice(5) : ''
    if (!day) return

    if (!dailyMap[day]) {
      dailyMap[day] = {
        date: day,
        income: 0,
        expense: 0
      }
    }

    const amount = Number(item.amount || 0)

    if (item.type === 'income') {
      dailyMap[day].income += amount
    }

    if (item.type === 'expense') {
      dailyMap[day].expense += amount
    }
  })

  expenseRecords.forEach(item => {
    const amount = Number(item.amount || 0)
    const categoryName = item.categoryName || '其他'

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = {
        name: categoryName,
        amount: 0,
        count: 0,
        color: item.categoryColor || '#8e8e93'
      }
    }

    categoryMap[categoryName].amount += amount
    categoryMap[categoryName].count += 1
  })

  const categoryStats = Object.values(categoryMap)
    .map(item => {
      return {
        ...item,
        amount: toMoney(item.amount),
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
        income: toMoney(item.income),
        expense: toMoney(item.expense)
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const topExpenses = expenseRecords
    .slice()
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5)
    .map(item => {
      return {
        id: item._id,
        date: item.date,
        categoryName: item.categoryName || '其他',
        amount: toMoney(item.amount),
        remark: item.remark || ''
      }
    })

  const recentRecords = records
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt || 0
      const bTime = b.createdAt || 0
      return bTime - aTime
    })
    .slice(0, 10)
    .map(item => {
      return {
        id: item._id,
        type: item.type,
        categoryName: item.categoryName || '其他',
        categoryIcon: item.categoryIcon || '',
        categoryColor: item.categoryColor || '#8e8e93',
        amount: toMoney(item.amount),
        date: item.date,
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
    dailyStats,
    topExpenses,
    recentRecords
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const month = event.month || getCurrentMonth()

  try {
    const records = await getAllRecords(openid, month)
    const summary = buildSummary(records, month)

    return {
      success: true,
      summary
    }
  } catch (error) {
    console.error('statistics-get error:', error)

    return {
      success: false,
      message: '获取统计数据失败',
      errorMessage: error.message
    }
  }
}
