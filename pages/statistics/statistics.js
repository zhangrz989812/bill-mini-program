// pages/statistics/statistics.js
const app = getApp()

Page({
  data: {
    // 时间范围：month-月度，year-年度
    timeRange: 'month',
    // 当前选中的时间
    currentDate: '',
    // 统计数据
    statistics: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categoryStats: []
    },
    // 图表数据
    chartData: [],
    // 加载状态
    loading: false
  },

  onLoad: function () {
    const today = new Date()
    const dateStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0')
    
    this.setData({
      currentDate: dateStr
    })
    
    this.loadStatistics()
  },

  onShow: function () {
    this.loadStatistics()
  },

  // 切换时间范围
  switchTimeRange: function (e) {
    const range = e.currentTarget.dataset.range
    this.setData({
      timeRange: range
    })
    this.loadStatistics()
  },

  // 切换时间
  changeDate: function (e) {
    this.setData({
      currentDate: e.detail.value
    })
    this.loadStatistics()
  },

  // 加载统计数据
  loadStatistics: function () {
    this.setData({ loading: true })

    const month = this.data.currentDate

    wx.cloud.callFunction({
      name: 'statistics-get',
      data: {
        month
      },
      success: (res) => {
        const result = res.result || {}

        if (!result.success) {
          this.setData({ loading: false })
          wx.showToast({
            title: result.message || '统计加载失败',
            icon: 'none'
          })
          return
        }

        const summary = result.summary || {}

        this.setData({
          statistics: {
            totalIncome: summary.totalIncome || 0,
            totalExpense: summary.totalExpense || 0,
            balance: summary.balance || 0,
            categoryStats: summary.categoryStats || []
          },
          chartData: summary.dailyStats || [],
          loading: false
        })
      },
      fail: (err) => {
        console.error('statistics-get 调用失败:', err)
        this.setData({ loading: false })

        wx.showToast({
          title: '统计加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看分类详情
  viewCategoryDetail: function (e) {
    const category = e.currentTarget.dataset.category
    wx.showToast({
      title: `查看${category.name}详情`,
      icon: 'none'
    })
  },

  // 导出数据
  exportData: function () {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    })
  }
})