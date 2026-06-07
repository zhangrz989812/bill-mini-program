// pages/ai-chat/ai-chat.js
Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    quickQuestions: [
      '分析本月消费',
      '餐饮花得多吗',
      '本月最大几笔支出是什么',
      '最近7天花销怎么样',
      '我这个月还有什么要注意',
      '给我三个省钱建议'
    ]
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  onQuickQuestion(e) {
    const question = e.currentTarget.dataset.question

    this.setData({
      inputValue: question
    })

    this.sendMessage()
  },

  sendMessage() {
    const content = this.data.inputValue.trim()

    if (!content || this.data.loading) {
      return
    }

    const userMessage = {
      role: 'user',
      content
    }

    this.setData({
      messages: this.data.messages.concat(userMessage),
      inputValue: '',
      loading: true
    })

    wx.cloud.callFunction({
      name: 'ai-chat',
      data: {
        message: content
      },
      success: (res) => {
        const result = res.result || {}

        const assistantMessage = {
          role: 'assistant',
          content: result.reply || result.message || '没有拿到有效回复'
        }

        this.setData({
          messages: this.data.messages.concat(assistantMessage),
          loading: false
        })
      },
      fail: (err) => {
        console.error('AI 请求失败:', err)

        const assistantMessage = {
          role: 'assistant',
          content: 'AI 请求失败，请稍后再试。'
        }

        this.setData({
          messages: this.data.messages.concat(assistantMessage),
          loading: false
        })
      }
    })
  },

  clearMessages() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空当前对话吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: []
          })
        }
      }
    })
  }
})
