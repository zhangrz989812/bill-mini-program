// app.js
App({
  onLaunch: function () {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      })
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    }

    // 获取用户信息
    this.getUserInfo()
  },

  getUserInfo: function () {
    // 检查用户是否已授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo
              // 用户信息已获取，可以进行后续操作
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    // 全局配置
    config: {
      appName: '记账本',
      version: '1.0.0'
    }
  }
})