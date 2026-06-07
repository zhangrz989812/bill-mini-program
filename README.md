# 微信小程序记账本

一款简洁易用的个人记账小程序，集成 AI 账单分析助手，帮助您轻松管理日常财务。

## 功能特性

### 核心功能
- ✅ **基础记账**：支持收入/支出记录，自动同步云端
- ✅ **分类管理**：预设常用分类，支持自定义
- ✅ **统计图表**：月度统计，分类占比分析，收支趋势
- ✅ **预算管理**：设置月度预算，监控支出进度
- ✅ **AI 账单助手**：基于 DeepSeek 的智能消费分析

### AI 账单助手
- 🤖 输入问题即可获得个性化消费分析
- 📊 自动获取本月账单摘要
- 💡 提供省钱建议和消费洞察
- 🔒 API Key 安全存储在云函数环境变量中

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端 | 微信小程序原生开发 |
| UI | TDesign 组件库（可选） |
| 后端 | 微信云开发 |
| 数据库 | 微信云数据库 |
| 云函数 | Node.js |
| AI | DeepSeek API |

## 项目结构

```
bill-mini-program/
├── app.js                          # 小程序入口
├── app.json                        # 全局配置
├── app.wxss                        # 全局样式
├── project.config.json             # 项目配置
├── package.json                    # 依赖配置
├── sitemap.json                    # 搜索索引配置
├── pages/
│   ├── index/                      # 首页（月度概览）
│   ├── record/                     # 记账页
│   ├── statistics/                 # 统计页
│   ├── category/                   # 分类页
│   ├── budget/                     # 预算页
│   ├── profile/                    # 我的页
│   └── ai-chat/                    # AI 账单助手
├── cloud/functions/
│   ├── record-add/                 # 添加记账记录
│   ├── statistics-get/             # 获取统计数据
│   └── ai-chat/                    # AI 分析（DeepSeek）
├── utils/
│   └── format.wxs                  # WXS 格式化工具
└── images/tab/                     # Tab 图标
```

## 快速开始

### 1. 环境准备

- 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号，获取 AppID
- 注册 [DeepSeek](https://platform.deepseek.com/) 获取 API Key

### 2. 克隆项目

```bash
git clone https://github.com/zhangrz989812/bill-mini-program.git
cd bill-mini-program
```

### 3. 配置项目

1. 打开微信开发者工具，导入项目
2. 修改 `project.config.json` 中的 `appid`
3. 修改 `app.js` 中的云环境 ID

### 4. 云开发配置

1. 在微信开发者工具中开通云开发
2. 创建 `records` 集合（权限：仅创建者可读写）
3. 部署云函数：
   - 右键 `cloud/functions/record-add` → 上传并部署
   - 右键 `cloud/functions/statistics-get` → 上传并部署
   - 右键 `cloud/functions/ai-chat` → 上传并部署

### 5. 配置 DeepSeek API

在 `ai-chat` 云函数的环境变量中配置：

| 变量名 | 值 |
|--------|-----|
| DEEPSEEK_API_KEY | 你的 DeepSeek API Key |
| DEEPSEEK_BASE_URL | https://api.deepseek.com |
| DEEPSEEK_MODEL | deepseek-chat |

### 6. 运行

点击「编译」按钮即可预览。

## 使用说明

### 记账
1. 点击首页「记一笔」
2. 选择收入/支出类型
3. 输入金额、选择分类
4. 保存记录

### 查看统计
1. 点击底部「统计」
2. 查看月度收支概览
3. 查看分类支出排行

### AI 分析
1. 进入「我的」→「AI账单助手」
2. 输入问题，如「分析本月消费」
3. 查看 AI 分析结果

## 云函数说明

### record-add
添加记账记录到云数据库。

### statistics-get
按月份查询统计数据，返回：
- 总收入/总支出/结余
- 分类支出排行
- 每日收支趋势
- 大额支出 Top5
- 最近记录

### ai-chat
获取本月账单摘要，调用 DeepSeek API 进行分析。

## 数据库设计

### records 集合

```json
{
  "_openid": "微信 openid",
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

## 开发文档

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 完整开发指南
- [AI_DEVELOPMENT.md](./AI_DEVELOPMENT.md) - AI 功能开发文档

## 更新日志

### v1.1.0 (2026-06-08)
- ✨ 新增 AI 账单助手功能
- ✨ 新增 record-add、statistics-get、ai-chat 云函数
- 🔧 记账/统计/首页接入真实云数据库
- 📝 新增 AI_DEVELOPMENT.md 文档

### v1.0.0 (2026-06-07)
- 🎉 首次发布
- ✅ 基础记账功能
- ✅ 分类管理
- ✅ 统计图表
- ✅ 预算管理

## 许可证

MIT License
