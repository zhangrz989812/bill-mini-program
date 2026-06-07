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
    
    // 模拟数据
    setTimeout(() => {
      this.setData({
        statistics: {
          totalIncome: 8500.00,
          totalExpense: 5230.50,
          balance: 3269.50,
          categoryStats: [
            { name: '餐饮', amount: 1580.00, percentage: 30.2, color: '#ff9500' },
            { name: '交通', amount: 850.50, percentage: 16.3, color: '#5856d6' },
            { name: '购物', amount: 1200.00, percentage: 22.9, color: '#ff2d55' },
            { name: '娱乐', amount: 650.00, percentage: 12.4, color: '#af52de' },
            { name: '其他', amount: 950.00, percentage: 18.2, color: '#8e8e93' }
          ]
        },
        chartData: [
          { date: '06-01', income: 8500, expense: 0 },
          { date: '06-02', income: 0, expense: 120 },
          { date: '06-03', income: 0, expense: 85 },
          { date: '06-04', income: 0, expense: 250 },
          { date: '06-05', income: 0, expense: 180 },
          { date: '06-06', income: 0, expense: 45 },
          { date: '06-07', income: 0, expense: 25.5 }
        ],
        loading: false
      })
    }, 1000)
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