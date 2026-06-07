// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event

  switch (action) {
    // 添加记录
    case 'addRecord':
      return await addRecord(wxContext, data)
    // 获取记录列表
    case 'getRecords':
      return await getRecords(wxContext, data)
    // 删除记录
    case 'deleteRecord':
      return await deleteRecord(wxContext, data)
    // 获取分类列表
    case 'getCategories':
      return await getCategories(wxContext)
    // 获取月度统计
    case 'getMonthStats':
      return await getMonthStats(wxContext, data)
    default:
      return { code: -1, msg: '未知操作' }
  }
}

// 添加记账记录
async function addRecord(wxContext, data) {
  try {
    const result = await db.collection('records').add({
      data: {
        _openid: wxContext.OPENID,
        type: data.type,         // 'income' 或 'expense'
        amount: data.amount,
        category: data.category,
        remark: data.remark || '',
        date: data.date,
        createdAt: db.serverDate()
      }
    })
    return { code: 0, msg: '添加成功', data: result }
  } catch (err) {
    return { code: -1, msg: '添加失败', error: err }
  }
}

// 获取记录列表
async function getRecords(wxContext, data) {
  try {
    const { page = 1, pageSize = 20, month } = data
    let query = db.collection('records').where({
      _openid: wxContext.OPENID
    })

    // 按月份筛选
    if (month) {
      const startDate = `${month}-01`
      const endDate = `${month}-32`
      query = query.where({
        date: _.gte(startDate).and(_.lt(endDate))
      })
    }

    const total = await query.count()
    const records = await query
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      code: 0,
      data: {
        records: records.data,
        total: total.total,
        page,
        pageSize
      }
    }
  } catch (err) {
    return { code: -1, msg: '获取失败', error: err }
  }
}

// 删除记录
async function deleteRecord(wxContext, data) {
  try {
    const result = await db.collection('records').doc(data.id).remove()
    return { code: 0, msg: '删除成功', data: result }
  } catch (err) {
    return { code: -1, msg: '删除失败', error: err }
  }
}

// 获取分类列表
async function getCategories(wxContext) {
  try {
    // 先获取系统默认分类
    const defaultCategories = await db.collection('categories').where({
      isDefault: true
    }).get()

    // 再获取用户自定义分类
    const userCategories = await db.collection('categories').where({
      _openid: wxContext.OPENID
    }).get()

    return {
      code: 0,
      data: {
        default: defaultCategories.data,
        custom: userCategories.data
      }
    }
  } catch (err) {
    return { code: -1, msg: '获取失败', error: err }
  }
}

// 获取月度统计
async function getMonthStats(wxContext, data) {
  try {
    const { month } = data
    const startDate = `${month}-01`
    const endDate = `${month}-32`

    const records = await db.collection('records').where({
      _openid: wxContext.OPENID,
      date: _.gte(startDate).and(_.lt(endDate))
    }).get()

    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = {}

    records.data.forEach(record => {
      if (record.type === 'income') {
        totalIncome += record.amount
      } else {
        totalExpense += record.amount
        // 按分类统计支出
        if (!categoryMap[record.category]) {
          categoryMap[record.category] = 0
        }
        categoryMap[record.category] += record.amount
      }
    })

    // 转换为分类统计数组
    const categoryStats = Object.keys(categoryMap).map(name => ({
      name,
      amount: categoryMap[name],
      percentage: totalExpense > 0 ? ((categoryMap[name] / totalExpense) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount)

    return {
      code: 0,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryStats
      }
    }
  } catch (err) {
    return { code: -1, msg: '统计失败', error: err }
  }
}
