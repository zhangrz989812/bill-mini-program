// pages/budget/budget.js
const app = getApp()

Page({
  data: {
    // 当前月份
    currentMonth: '',
    // 总预算
    totalBudget: 0,
    // 已使用预算
    usedBudget: 0,
    // 剩余预算
    remainingBudget: 0,
    // 预算进度
    budgetProgress: 0,
    // 分类预算
    categoryBudgets: [],
    // 编辑状态
    isEditing: false,
    // 新增预算弹窗
    showModal: false,
    // 可选分类
    availableCategories: [],
    newBudget: {
      categoryId: '',
      categoryName: '',
      amount: 0
    },
    // 加载状态
    loading: false
  },

  onLoad: function () {
    const today = new Date()
    const monthStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0')
    
    this.setData({
      currentMonth: monthStr
    })
    
    this.loadBudgetData()
  },

  onShow: function () {
    this.loadBudgetData()
  },

  // 切换月份
  changeMonth: function (e) {
    this.setData({
      currentMonth: e.detail.value
    })
    this.loadBudgetData()
  },

  // 加载预算数据
  loadBudgetData: function () {
    this.setData({ loading: true })
    
    // 模拟数据
    setTimeout(() => {
      this.setData({
        totalBudget: 8000,
        usedBudget: 5230.50,
        remainingBudget: 2769.50,
        budgetProgress: 65.4,
        categoryBudgets: [
          { id: 1, categoryId: 1, categoryName: '餐饮', budget: 2000, used: 1580, percentage: 79 },
          { id: 2, categoryId: 2, categoryName: '交通', budget: 1000, used: 850.50, percentage: 85.1 },
          { id: 3, categoryId: 3, categoryName: '购物', budget: 1500, used: 1200, percentage: 80 },
          { id: 4, categoryId: 4, categoryName: '娱乐', budget: 800, used: 650, percentage: 81.3 },
          { id: 5, categoryId: 8, categoryName: '通讯', budget: 500, used: 320, percentage: 64 }
        ],
        availableCategories: [
          { id: 6, name: '教育' },
          { id: 7, name: '居住' },
          { id: 9, name: '服饰' },
          { id: 10, name: '美容' }
        ],
        loading: false
      })
    }, 1000)
  },

  // 开始编辑
  startEditing: function () {
    this.setData({
      isEditing: true
    })
  },

  // 结束编辑
  stopEditing: function () {
    this.setData({
      isEditing: false
    })
  },

  // 修改总预算
  changeTotalBudget: function (e) {
    const value = e.detail.value
    this.setData({
      totalBudget: parseFloat(value) || 0,
      remainingBudget: (parseFloat(value) || 0) - this.data.usedBudget
    })
  },

  // 显示新增弹窗
  showAddModal: function () {
    this.setData({
      showModal: true,
      newBudget: {
        categoryId: '',
        categoryName: '',
        amount: 0
      }
    })
  },

  // 隐藏弹窗
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },

  // 选择分类
  selectCategory: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      'newBudget.categoryId': category.id,
      'newBudget.categoryName': category.name
    })
  },

  // 输入预算金额
  inputBudgetAmount: function (e) {
    this.setData({
      'newBudget.amount': parseFloat(e.detail.value) || 0
    })
  },

  // 添加分类预算
  addCategoryBudget: function () {
    const { newBudget, categoryBudgets, availableCategories } = this.data
    
    if (!newBudget.categoryId) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }
    
    if (newBudget.amount <= 0) {
      wx.showToast({
        title: '请输入预算金额',
        icon: 'none'
      })
      return
    }

    // 检查是否已存在
    const exists = categoryBudgets.find(b => b.categoryId === newBudget.categoryId)
    if (exists) {
      wx.showToast({
        title: '该分类已有预算',
        icon: 'none'
      })
      return
    }

    // 模拟添加
    const newId = Math.max(...categoryBudgets.map(b => b.id), 0) + 1
    const newBudgetItem = {
      id: newId,
      categoryId: newBudget.categoryId,
      categoryName: newBudget.categoryName,
      budget: newBudget.amount,
      used: 0,
      percentage: 0
    }
    
    // 从可用分类中移除
    const filteredCategories = availableCategories.filter(c => c.id !== newBudget.categoryId)
    
    this.setData({
      categoryBudgets: [...categoryBudgets, newBudgetItem],
      availableCategories: filteredCategories,
      showModal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  // 删除分类预算
  deleteCategoryBudget: function (e) {
    const id = e.currentTarget.dataset.id
    const { categoryBudgets, availableCategories } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个分类预算吗？',
      success: (res) => {
        if (res.confirm) {
          const deletedBudget = categoryBudgets.find(b => b.id === id)
          const filteredBudgets = categoryBudgets.filter(b => b.id !== id)
          
          // 恢复到可用分类
          if (deletedBudget) {
            const restoredCategory = { id: deletedBudget.categoryId, name: deletedBudget.categoryName }
            this.setData({
              categoryBudgets: filteredBudgets,
              availableCategories: [...availableCategories, restoredCategory]
            })
          } else {
            this.setData({
              categoryBudgets: filteredBudgets
            })
          }
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 保存预算设置
  saveBudgetSettings: function () {
    const { totalBudget, categoryBudgets } = this.data
    
    wx.showLoading({
      title: '保存中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      this.setData({
        isEditing: false
      })
    }, 1000)
  }
})