// pages/category/category.js
const app = getApp()

Page({
  data: {
    // 分类类型：expense-支出，income-收入
    categoryType: 'expense',
    // 分类列表
    categories: [],
    // 编辑状态
    isEditing: false,
    // 新增分类弹窗
    showModal: false,
    newCategory: {
      name: '',
      icon: '📝',
      color: '#0052d9'
    },
    // 预设图标
    presetIcons: ['🍜', '🚌', '🛒', '🎮', '💊', '📚', '🏠', '📱', '👔', '💄', '💰', '🎁', '📈', '💼', '📝', '🎮', '🚗', '✈️', '🎬', '🐱'],
    // 预设颜色
    presetColors: ['#ff9500', '#5856d6', '#ff2d55', '#af52de', '#ff3b30', '#007aff', '#34c759', '#00c7be', '#ff6b6b', '#ff85c0', '#07c160', '#00b578', '#faad14', '#1890ff', '#8e8e93']
  },

  onLoad: function () {
    this.loadCategories()
  },

  onShow: function () {
    this.loadCategories()
  },

  // 切换分类类型
  switchType: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      categoryType: type
    })
    this.loadCategories()
  },

  // 加载分类数据
  loadCategories: function () {
    const { categoryType } = this.data
    
    // 模拟数据
    const mockData = {
      expense: [
        { id: 1, name: '餐饮', icon: '🍜', color: '#ff9500', count: 15, isDefault: true },
        { id: 2, name: '交通', icon: '🚌', color: '#5856d6', count: 8, isDefault: true },
        { id: 3, name: '购物', icon: '🛒', color: '#ff2d55', count: 12, isDefault: true },
        { id: 4, name: '娱乐', icon: '🎮', color: '#af52de', count: 5, isDefault: true },
        { id: 5, name: '医疗', icon: '💊', color: '#ff3b30', count: 2, isDefault: true },
        { id: 6, name: '教育', icon: '📚', color: '#007aff', count: 3, isDefault: true },
        { id: 7, name: '居住', icon: '🏠', color: '#34c759', count: 1, isDefault: true },
        { id: 8, name: '通讯', icon: '📱', color: '#00c7be', count: 4, isDefault: true },
        { id: 9, name: '服饰', icon: '👔', color: '#ff6b6b', count: 6, isDefault: true },
        { id: 10, name: '美容', icon: '💄', color: '#ff85c0', count: 3, isDefault: true },
        { id: 11, name: '其他', icon: '📝', color: '#8e8e93', count: 7, isDefault: true }
      ],
      income: [
        { id: 101, name: '工资', icon: '💰', color: '#07c160', count: 1, isDefault: true },
        { id: 102, name: '奖金', icon: '🎁', color: '#00b578', count: 2, isDefault: true },
        { id: 103, name: '投资', icon: '📈', color: '#faad14', count: 3, isDefault: true },
        { id: 104, name: '兼职', icon: '💼', color: '#1890ff', count: 4, isDefault: true },
        { id: 105, name: '其他', icon: '📝', color: '#8e8e93', count: 1, isDefault: true }
      ]
    }
    
    this.setData({
      categories: mockData[categoryType]
    })
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

  // 显示新增弹窗
  showAddModal: function () {
    this.setData({
      showModal: true,
      newCategory: {
        name: '',
        icon: '📝',
        color: '#0052d9'
      }
    })
  },

  // 隐藏弹窗
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },

  // 输入分类名称
  inputCategoryName: function (e) {
    this.setData({
      'newCategory.name': e.detail.value
    })
  },

  // 选择图标
  selectIcon: function (e) {
    const icon = e.currentTarget.dataset.icon
    this.setData({
      'newCategory.icon': icon
    })
  },

  // 选择颜色
  selectColor: function (e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      'newCategory.color': color
    })
  },

  // 添加分类
  addCategory: function () {
    const { newCategory, categoryType, categories } = this.data
    
    if (!newCategory.name.trim()) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      })
      return
    }

    // 模拟添加
    const newId = categoryType === 'expense' ? 
      Math.max(...categories.map(c => c.id)) + 1 : 
      Math.max(...categories.map(c => c.id)) + 1
    
    const newCategoryItem = {
      id: newId,
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
      count: 0,
      isDefault: false
    }
    
    this.setData({
      categories: [...categories, newCategoryItem],
      showModal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  // 删除分类
  deleteCategory: function (e) {
    const id = e.currentTarget.dataset.id
    const { categories } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      success: (res) => {
        if (res.confirm) {
          const filteredCategories = categories.filter(c => c.id !== id)
          this.setData({
            categories: filteredCategories
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 编辑分类
  editCategory: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `编辑分类 ${id}`,
      icon: 'none'
    })
  }
})