// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    // 菜单列表
    menuList: [
      {
        id: 'ai',
        title: 'AI账单助手',
        icon: '🤖',
        url: '/pages/ai-chat/ai-chat'
      },
      {
        id: 'budget',
        title: '预算管理',
        icon: '💰',
        url: '/pages/budget/budget'
      },
      {
        id: 'category',
        title: '分类管理',
        icon: '📂',
        url: '/pages/category/category'
      },
      {
        id: 'settings',
        title: '设置',
        icon: '⚙️',
        action: 'openSettings'
      },
      {
        id: 'about',
        title: '关于',
        icon: 'ℹ️',
        action: 'showAbout'
      }
    ],
    // 版本信息
    version: '1.0.0'
  },

  onLoad: function () {
    // 从缓存获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
      app.globalData.userInfo = userInfo
    }
  },

  // 选择头像（新版API）
  onChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
    // 保存到缓存
    wx.setStorageSync('userInfo', this.data.userInfo)
    app.globalData.userInfo = this.data.userInfo
  },

  // 输入昵称
  onInputNickname: function (e) {
    const nickName = e.detail.value
    this.setData({
      'userInfo.nickName': nickName,
      hasUserInfo: true
    })
    // 保存到缓存
    wx.setStorageSync('userInfo', this.data.userInfo)
    app.globalData.userInfo = this.data.userInfo
  },

  // 菜单点击
  menuClick: function (e) {
    const menu = e.currentTarget.dataset.menu
    
    if (menu.url) {
      wx.navigateTo({
        url: menu.url
      })
    } else if (menu.action) {
      this[menu.action]()
    }
  },

  // 打开设置
  openSettings: function () {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  // 显示关于
  showAbout: function () {
    wx.showModal({
      title: '关于记账本',
      content: `版本：${this.data.version}\n\n一款简洁易用的个人记账小程序，帮助您轻松管理财务。`,
      showCancel: false
    })
  },

  // 清除缓存
  clearCache: function () {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '清除成功',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            userInfo: null,
            hasUserInfo: false
          })
          app.globalData.userInfo = null
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})