# AI 账单助手 - 开发文档

## 📋 功能说明

AI 账单助手是记账本小程序的智能分析功能，基于 DeepSeek API 实现。用户可以输入问题，系统会自动获取本月账单数据，生成摘要后交给 DeepSeek 分析，返回个性化的消费建议。

### 核心流程

```
用户输入问题
  ↓
小程序调用 ai-chat 云函数
  ↓
云函数查询本月 records 集合
  ↓
云函数计算账单摘要
  ↓
云函数调用 DeepSeek API
  ↓
返回 AI 分析结果
```

### 设计原则

- **系统负责算账，DeepSeek 负责解释账**
- AI 不直接访问数据库，只接收摘要数据
- API Key 只存放在云函数环境变量中，不暴露给前端

---

## 🗄️ 新增云数据库集合

### records 集合

在微信云开发控制台创建 `records` 集合。

#### 数据结构

```json
{
  "_openid": "微信 openid，由云函数自动写入",
  "type": "expense",
  "amount": 45.5,
  "categoryId": 1,
  "categoryName": "餐饮",
  "categoryIcon": "🍜",
  "categoryColor": "#ff9500",
  "date": "2026-06-07",
  "month": "2026-06",
  "remark": "午餐",
  "images": [],
  "createdAt": 1780000000000,
  "updatedAt": 1780000000000
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| _openid | string | 微信 openid，云函数自动写入 |
| type | string | income 或 expense |
| amount | number | 金额（正数） |
| categoryId | number | 分类 ID |
| categoryName | string | 分类名称 |
| categoryIcon | string | 分类图标 |
| categoryColor | string | 分类颜色 |
| date | string | 日期，格式 YYYY-MM-DD |
| month | string | 月份，格式 YYYY-MM |
| remark | string | 备注 |
| images | array | 图片 URL 数组 |
| createdAt | number | 创建时间戳 |
| updatedAt | number | 更新时间戳 |

#### 权限设置

个人项目建议使用「仅创建者可读写」。

---

## ☁️ 新增云函数

### 1. record-add

**功能**：保存用户新增的记账记录

**目录**：`cloud/functions/record-add/`

**输入**：

```json
{
  "type": "expense",
  "amount": 45.5,
  "categoryId": 1,
  "categoryName": "餐饮",
  "categoryIcon": "🍜",
  "categoryColor": "#ff9500",
  "date": "2026-06-07",
  "remark": "午餐",
  "images": []
}
```

**输出**：

```json
{
  "success": true,
  "id": "云数据库记录ID"
}
```

### 2. statistics-get

**功能**：根据指定月份统计数据

**目录**：`cloud/functions/statistics-get/`

**输入**：

```json
{
  "month": "2026-06"
}
```

**输出**：

```json
{
  "success": true,
  "summary": {
    "month": "2026-06",
    "totalIncome": 8500,
    "totalExpense": 5230.5,
    "balance": 3269.5,
    "recordCount": 36,
    "categoryStats": [],
    "dailyStats": [],
    "topExpenses": [],
    "recentRecords": []
  }
}
```

### 3. ai-chat

**功能**：获取本月账单摘要并调用 DeepSeek API

**目录**：`cloud/functions/ai-chat/`

**输入**：

```json
{
  "message": "帮我分析本月消费"
}
```

**输出**：

```json
{
  "success": true,
  "reply": "AI 分析内容",
  "summary": {
    "month": "2026-06",
    "totalIncome": 8500,
    "totalExpense": 5230.5
  }
}
```

---

## 🔑 DeepSeek API 环境变量配置

在 `ai-chat` 云函数中配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| DEEPSEEK_BASE_URL | DeepSeek API 基础 URL | https://api.deepseek.com |
| DEEPSEEK_API_KEY | DeepSeek API Key | sk-xxx（你的真实 Key） |
| DEEPSEEK_MODEL | 使用的模型名称 | deepseek-chat |

### 配置步骤

1. 登录微信公众平台
2. 进入「开发」→「云开发」
3. 选择「云函数」
4. 找到 `ai-chat` 云函数
5. 点击「编辑」→「环境变量」
6. 添加上述三个环境变量

### 注意事项

- **不要在前端代码中写入 API Key**
- DEEPSEEK_MODEL 可根据 DeepSeek 官方推荐调整
- 如果 DeepSeek 官方 URL 变化，只需修改 DEEPSEEK_BASE_URL

---

## 🚀 部署步骤

### 1. 微信开发者工具操作

1. 打开微信开发者工具
2. 导入项目目录
3. 确认 `app.js` 中 `env` 已替换为你的云开发环境 ID

### 2. 创建云数据库集合

1. 在云开发控制台创建 `records` 集合
2. 设置权限为「仅创建者可读写」

### 3. 部署云函数

1. 右键 `cloud/functions/record-add` → 上传并部署：云端安装依赖
2. 右键 `cloud/functions/statistics-get` → 上传并部署：云端安装依赖
3. 右键 `cloud/functions/ai-chat` → 上传并部署：云端安装依赖

### 4. 配置环境变量

1. 在云开发控制台找到 `ai-chat` 云函数
2. 添加 DEEPSEEK_API_KEY 等环境变量

### 5. 编译运行

1. 点击「编译」按钮
2. 测试完整流程

---

## 🧪 测试步骤

### 基础功能测试

1. **记账功能**
   - 新增一笔支出记录
   - 确认保存成功
   - 返回首页查看数据是否更新

2. **统计功能**
   - 进入统计页
   - 确认显示真实数据
   - 切换月份查看历史数据

3. **AI 功能**
   - 进入「我的」→「AI账单助手」
   - 输入"分析本月消费"
   - 确认返回 AI 分析结果

### 特殊情况测试

1. **无数据情况**
   - 本月没有任何记录时，AI 应说明暂无账单数据

2. **API Key 未配置**
   - 不配置 DEEPSEEK_API_KEY 时，应返回配置错误提示

3. **空问题**
   - 输入空问题时，不应调用云函数

4. **网络异常**
   - 断网情况下，应有错误提示

---

## ❓ 常见问题

### Q: AI 返回"未配置 DEEPSEEK_API_KEY"？

A: 检查 `ai-chat` 云函数的环境变量是否正确配置。

### Q: 统计页数据不更新？

A: 检查：
1. 云函数是否部署成功
2. records 集合是否有数据
3. 网络连接是否正常

### Q: 记账保存失败？

A: 检查：
1. 云开发环境 ID 是否正确
2. records 集合是否创建
3. 云函数是否部署

### Q: AI 分析结果不准确？

A: 第一版 AI 只基于本月摘要数据分析，如果数据量少，分析可能不够详细。建议多记几笔账后再试。

---

## 📝 更新日志

### v1.0.0 (2026-06-08)
- 新增 AI 账单助手功能
- 新增 record-add 云函数
- 新增 statistics-get 云函数
- 新增 ai-chat 云函数
- 修改记账页接入真实数据库
- 修改统计页读取真实数据
- 修改首页读取真实数据
- 新增 AI 对话页面

---

## 🔒 安全说明

1. **API Key 安全**
   - DeepSeek API Key 只存放在云函数环境变量中
   - 前端代码不包含任何敏感信息

2. **数据安全**
   - 每个用户只能访问自己的数据
   - 云函数自动验证 openid

3. **AI 安全**
   - AI 只能基于提供的摘要数据回答
   - 不会编造不存在的数据
   - 不会泄露数据库结构
