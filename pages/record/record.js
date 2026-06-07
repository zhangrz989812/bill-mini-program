// pages/record/record.js
const app = getApp()

Page({
  data: {
    // 记录类型：income-收入，expense-支出
    recordType: 'expense',
    // 金额
    amount: '',
    // 分类
    categories: [],
    selectedCategory: null,
    // 日期
    date: '',
    // 备注
    remark: '',
    // 图片
    images: [],
    // 分类列表
    categoryList: {
      expense: [
        { id: 1, name: '餐饮', icon: '🍜', color: '#ff9500' },
        { id: 2, name: '交通', icon: '🚌', color: '#5856d6' },
        { id: 3, name: '购物', icon: '🛒', color: '#ff2d55' },
        { id: 4, name: '娱乐', icon: '🎮', color: '#af52de' },
        { id: 5, name: '医疗', icon: '💊', color: '#ff3b30' },
        { id: 6, name: '教育', icon: '📚', color: '#007aff' },
        { id: 7, name: '居住', icon: '🏠', color: '#34c759' },
        { id: 8, name: '通讯', icon: '📱', color: '#00c7be' },
        { id: 9, name: '服饰', icon: '👔', color: '#ff6b6b' },
        { id: 10, name: '美容', icon: '💄', color: '#ff85c0' },
        { id: 11, name: '其他', icon: '📝', color: '#8e8e93' }
      ],
      income: [
        { id: 101, name: '工资', icon: '💰', color: '#07c160' },
        { id: 102, name: '奖金', icon: '🎁', color: '#00b578' },
        { id: 103, name: '投资', icon: '📈', color: '#faad14' },
        { id: 104, name: '兼职', icon: '💼', color: '#1890ff' },
        { id: 105, name: '其他', icon: '📝', color: '#8e8e93' }
      ]
    }
  },

  onLoad: function (options) {
    // 设置默认日期为今天
    const today = new Date()
    const dateStr = today.getFullYear() + '-' + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                   today.getDate().toString().padStart(2, '0')
    
    this.setData({
      date: dateStr,
      categories: this.data.categoryList.expense,
      selectedCategory: this.data.categoryList.expense[0]
    })
  },

  // 切换记录类型
  switchType: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      recordType: type,
      categories: this.data.categoryList[type],
      selectedCategory: this.data.categoryList[type][0]
    })
  },

  // 选择分类
  selectCategory: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category
    })
  },

  // 输入金额
  inputAmount: function (e) {
    this.setData({
      amount: e.detail.value
    })
  },

  // 选择日期
  changeDate: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 输入备注
  inputRemark: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 选择图片
  chooseImage: function () {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
      }
    })
  },

  // 删除图片
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({
      images: images
    })
  },

  // 保存记录
  saveRecord: function () {
    const { recordType, amount, selectedCategory, date, remark, images } = this.data

    // 验证
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入正确金额',
        icon: 'none'
      })
      return
    }

    if (!selectedCategory) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }

    // 构建记录数据
    const record = {
      type: recordType,
      amount: parseFloat(amount),
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date: date,
      remark: remark,
      images: images
    }

    // 调用云函数保存记录
    wx.showLoading({
      title: '保存中...'
    })

    wx.cloud.callFunction({
      name: 'record-add',
      data: record,
      success: (res) => {
        wx.hideLoading()

        const result = res.result || {}

        if (result.success) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({
            title: result.message || '保存失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('record-add 调用失败:', err)

        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },

  // 预览图片
  previewImage: function (e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.images
    })
  }
})