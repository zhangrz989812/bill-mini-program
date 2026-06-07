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

  getCurrentMonth: function () {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  },

  loadData: function () {
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'statistics-get',
      data: {
        month: this.getCurrentMonth()
      },
      success: (res) => {
        const result = res.result || {}

        if (!result.success) {
          this.setData({ loading: false })
          wx.showToast({
            title: result.message || '数据加载失败',
            icon: 'none'
          })
          return
        }

        const summary = result.summary || {}

        const recentRecords = (summary.recentRecords || []).map(item => {
          return {
            id: item.id,
            type: item.type,
            category: item.categoryName,
            amount: item.type === 'expense' ? -item.amount : item.amount,
            date: item.date,
            remark: item.remark
          }
        })

        this.setData({
          monthOverview: {
            totalIncome: summary.totalIncome || 0,
            totalExpense: summary.totalExpense || 0,
            balance: summary.balance || 0
          },
          recentRecords,
          loading: false
        })
      },
      fail: (err) => {
        console.error('首页数据加载失败:', err)

        this.setData({ loading: false })

        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    })
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