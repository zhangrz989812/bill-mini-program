// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    // 月度收支概览
    monthOverview: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0
    },
    // 最近记录
    recentRecords: [],
    // 加载状态
    loading: false
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
    
    this.loadData()
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.loadData()
  },

  loadData: function () {
    this.setData({ loading: true })
    
    // 模拟数据加载
    setTimeout(() => {
      this.setData({
        monthOverview: {
          totalIncome: 8500.00,
          totalExpense: 5230.50,
          balance: 3269.50
        },
        recentRecords: [
          {
            id: 1,
            type: 'expense',
            category: '餐饮',
            amount: -45.00,
            date: '2026-06-07',
            remark: '午餐'
          },
          {
            id: 2,
            type: 'income',
            category: '工资',
            amount: 8500.00,
            date: '2026-06-01',
            remark: '6月工资'
          },
          {
            id: 3,
            type: 'expense',
            category: '交通',
            amount: -25.50,
            date: '2026-06-06',
            remark: '地铁'
          }
        ],
        loading: false
      })
    }, 1000)
  },

  // 跳转到记账页面
  goToRecord: function () {
    wx.navigateTo({
      url: '/pages/record/record'
    })
  },

  // 查看所有记录
  viewAllRecords: function () {
    wx.navigateTo({
      url: '/pages/statistics/statistics'
    })
  },

  // 选择头像（新版API）
  onChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
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
    wx.setStorageSync('userInfo', this.data.userInfo)
    app.globalData.userInfo = this.data.userInfo
  }
})