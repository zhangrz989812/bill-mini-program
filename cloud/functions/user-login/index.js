// 云函数：user-login
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取用户信息
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 获取用户 openid
  const openid = wxContext.OPENID
  const appid = wxContext.APPID
  const unionid = wxContext.UNIONID
  
  // 查询用户是否已存在
  const db = cloud.database()
  const userCollection = db.collection('users')
  
  try {
    // 查询用户
    const userRes = await userCollection.where({
      openid: openid
    }).get()
    
    if (userRes.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
        code: 0,
        message: '获取成功',
        data: userRes.data[0]
      }
    } else {
      // 用户不存在，创建新用户
      const newUser = {
        openid: openid,
        appid: appid,
        unionid: unionid || '',
        nickName: event.userInfo?.nickName || '新用户',
        avatarUrl: event.userInfo?.avatarUrl || '',
        gender: event.userInfo?.gender || 0,
        city: event.userInfo?.city || '',
        province: event.userInfo?.province || '',
        country: event.userInfo?.country || '',
        language: event.userInfo?.language || 'zh_CN',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
      
      const addRes = await userCollection.add({
        data: newUser
      })
      
      return {
        code: 0,
        message: '注册成功',
        data: {
          _id: addRes._id,
          ...newUser
        }
      }
    }
  } catch (err) {
    console.error('用户登录失败:', err)
    return {
      code: -1,
      message: '登录失败',
      error: err.message
    }
  }
}