const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function isValidDateText(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const {
    type,
    amount,
    categoryId,
    categoryName,
    categoryIcon,
    categoryColor,
    date,
    remark,
    images
  } = event

  if (!['income', 'expense'].includes(type)) {
    return {
      success: false,
      message: '记录类型不正确'
    }
  }

  const realAmount = Number(amount)

  if (!realAmount || realAmount <= 0) {
    return {
      success: false,
      message: '金额不正确'
    }
  }

  if (!isValidDateText(date)) {
    return {
      success: false,
      message: '日期格式不正确'
    }
  }

  if (!categoryName) {
    return {
      success: false,
      message: '分类不能为空'
    }
  }

  const now = Date.now()
  const month = date.slice(0, 7)

  const record = {
    _openid: openid,
    type,
    amount: Number(realAmount.toFixed(2)),
    categoryId,
    categoryName,
    categoryIcon: categoryIcon || '',
    categoryColor: categoryColor || '#8e8e93',
    date,
    month,
    remark: remark || '',
    images: Array.isArray(images) ? images : [],
    createdAt: now,
    updatedAt: now
  }

  try {
    const res = await db.collection('records').add({
      data: record
    })

    return {
      success: true,
      id: res._id
    }
  } catch (error) {
    console.error('record-add error:', error)

    return {
      success: false,
      message: '保存记录失败',
      errorMessage: error.message
    }
  }
}
