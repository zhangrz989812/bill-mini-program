// 云函数：add-record
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 添加记账记录
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 获取参数
  const { type, amount, categoryId, categoryName, categoryIcon, categoryColor, date, remark, images } = event
  
  // 参数验证
  if (!type || !amount || !categoryId || !date) {
    return {
      code: -1,
      message: '缺少必要参数'
    }
  }
  
  // 验证金额
  if (typeof amount !== 'number' || amount <= 0) {
    return {
      code: -1,
      message: '金额必须为正数'
    }
  }
  
  // 验证类型
  if (!['income', 'expense'].includes(type)) {
    return {
      code: -1,
      message: '类型必须为income或expense'
    }
  }
  
  const db = cloud.database()
  const recordCollection = db.collection('records')
  
  try {
    // 构建记录数据
    const record = {
      openid: openid,
      type: type,
      amount: amount,
      categoryId: categoryId,
      categoryName: categoryName || '',
      categoryIcon: categoryIcon || '',
      categoryColor: categoryColor || '',
      date: date,
      remark: remark || '',
      images: images || [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
    
    // 添加记录
    const addRes = await recordCollection.add({
      data: record
    })
    
    // 更新用户统计（可选）
    // 这里可以添加更新用户总收支的逻辑
    
    return {
      code: 0,
      message: '添加成功',
      data: {
        _id: addRes._id,
        ...record
      }
    }
  } catch (err) {
    console.error('添加记录失败:', err)
    return {
      code: -1,
      message: '添加失败',
      error: err.message
    }
  }
}