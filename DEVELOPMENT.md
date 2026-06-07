# 记账本小程序 - 开发文档

## 📋 项目概述

**记账本**是一款基于微信小程序 + 云开发的个人财务管理工具，帮助用户轻松记录收支、查看统计、管理预算。

- **技术栈**：微信小程序 + 云开发（CloudBase）+ TDesign 组件库
- **目标用户**：个人用户，需要简单记账的场景
- **核心功能**：记账、统计、分类、预算管理

---

## 🚀 快速开始

### 1. 环境准备

#### 必装工具

| 工具 | 说明 | 下载地址 |
|------|------|----------|
| 微信开发者工具 | 官方 IDE，集成调试、预览、上传 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |
| Git | 版本控制 | https://git-scm.com/downloads |
| Node.js | npm 包管理（用于 TDesign） | https://nodejs.org/ |

#### 可选工具

| 工具 | 说明 |
|------|------|
| VS Code | 代码编辑器（推荐） |
| 微信开发者工具插件 | VS Code 插件，支持语法高亮 |

### 2. 获取 AppID

1. 访问 https://mp.weixin.qq.com/
2. 注册小程序账号（需要未注册过公众平台的邮箱）
3. 在「开发管理」→「开发设置」中获取 **AppID**

### 3. 克隆项目

```bash
git clone <your-repo-url>
cd bill-mini-program
```

### 4. 配置项目

#### 修改 AppID

编辑 `project.config.json`，将 `appid` 替换为你的真实 AppID：

```json
{
  "appid": "your-real-appid-here"
}
```

#### 开通云开发

1. 打开微信开发者工具
2. 导入项目目录
3. 点击工具栏的「云开发」按钮
4. 开通云开发，获取环境 ID
5. 编辑 `app.js`，将 `env` 替换为你的云环境 ID：

```javascript
wx.cloud.init({
  env: 'your-real-env-id',
  traceUser: true
})
```

### 5. 安装依赖

```bash
npm install
```

### 6. 构建 npm

在微信开发者工具中：
1. 点击菜单「工具」→「构建 npm」
2. 等待构建完成
3. 勾选「编译」→「ES6 转 ES5」

### 7. 运行项目

点击工具栏的「编译」按钮（或 Ctrl+B），即可在模拟器中预览。

---

## 📁 项目结构

```
bill-mini-program/
├── app.js                    # 小程序入口（云开发初始化）
├── app.json                  # 全局配置（页面路由、tabBar、窗口）
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置（AppID、npm 构建）
├── package.json              # npm 依赖
├── sitemap.json              # 微信搜索索引配置
├── cloud/                    # 云函数目录
│   └── index/                # 主云函数
│       ├── index.js          # 云函数逻辑
│       └── package.json      # 云函数依赖
├── pages/                    # 页面目录
│   ├── index/                # 首页（月度概览、快捷操作）
│   ├── record/               # 记账页（添加/编辑记录）
│   ├── statistics/           # 统计页（图表、分类统计）
│   ├── category/             # 分类页（分类管理）
│   ├── budget/               # 预算页（预算设置）
│   └── profile/              # 我的页（用户信息、设置）
├── utils/                    # 工具函数
│   └── format.wxs            # WXS 格式化工具（金额、日期）
├── images/                   # 图片资源
│   └── tab/                  # Tab 图标
└── miniprogram_npm/          # npm 构建输出（自动生成）
```

---

## 🏗️ 架构设计

### 页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/pages/index/index` | 月度概览、快捷操作、最近记录 |
| 记账 | `/pages/record/record` | 添加/编辑收支记录 |
| 统计 | `/pages/statistics/statistics` | 图表展示、分类统计 |
| 分类 | `/pages/category/category` | 分类管理（增删改） |
| 预算 | `/pages/budget/budget` | 预算设置、使用情况 |
| 我的 | `/pages/profile/profile` | 用户信息、设置、关于 |

### 数据库设计

#### records 集合（记账记录）

```json
{
  "_id": "自动生成",
  "_openid": "用户 OpenID",
  "type": "expense",           // income 或 expense
  "amount": 45.00,             // 金额
  "category": "餐饮",          // 分类名称
  "remark": "午餐",            // 备注
  "date": "2026-06-07",        // 日期
  "createdAt": "ServerDate"    // 创建时间
}
```

#### categories 集合（分类）

```json
{
  "_id": "自动生成",
  "_openid": "用户 OpenID 或 空（系统默认）",
  "name": "餐饮",              // 分类名称
  "icon": "🍜",               // 图标
  "type": "expense",           // income 或 expense
  "isDefault": true            // 是否系统默认
}
```

#### budgets 集合（预算）

```json
{
  "_id": "自动生成",
  "_openid": "用户 OpenID",
  "month": "2026-06",          // 月份
  "totalBudget": 5000.00,      // 总预算
  "categoryBudgets": [         // 分类预算
    {
      "categoryId": "xxx",
      "categoryName": "餐饮",
      "budget": 2000.00,
      "used": 1580.00
    }
  ]
}
```

### 云函数接口

主云函数 `cloud/index` 提供以下接口：

| action | 说明 | 参数 |
|--------|------|------|
| `addRecord` | 添加记录 | `{ type, amount, category, remark, date }` |
| `getRecords` | 获取记录列表 | `{ page, pageSize, month }` |
| `deleteRecord` | 删除记录 | `{ id }` |
| `getCategories` | 获取分类列表 | 无 |
| `getMonthStats` | 获取月度统计 | `{ month }` |

---

## 🛠️ 开发指南

### 1. 添加新页面

1. 在 `pages/` 目录下创建新页面目录（如 `pages/new-page/`）
2. 创建四个文件：`new-page.js`、`new-page.json`、`new-page.wxml`、`new-page.wxss`
3. 在 `app.json` 的 `pages` 数组中添加页面路径

```json
{
  "pages": [
    "pages/index/index",
    "pages/new-page/new-page"
  ]
}
```

### 2. 使用 TDesign 组件

#### 安装组件

```bash
npm install tdesign-miniprogram --save
```

#### 引入组件

在页面的 `.json` 文件中引入：

```json
{
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button",
    "t-input": "tdesign-miniprogram/input/input"
  }
}
```

#### 使用组件

```html
<t-button theme="primary" size="large">点击按钮</t-button>
<t-input label="金额" placeholder="请输入金额" type="digit" />
```

### 3. WXS 格式化

项目提供了 `utils/format.wxs` 工具模块，用于在 WXML 中格式化数据：

```html
<wxs src="../../utils/format.wxs" module="fmt" />

<!-- 格式化金额 -->
<text>¥{{fmt.toFixed2(amount)}}</text>

<!-- 格式化金额（带千分位） -->
<text>¥{{fmt.formatMoney(amount)}}</text>

<!-- 格式化日期 -->
<text>{{fmt.formatDate(date)}}</text>
```

### 4. 云开发操作

#### 调用云函数

```javascript
wx.cloud.callFunction({
  name: 'index',
  data: {
    action: 'addRecord',
    data: {
      type: 'expense',
      amount: 45.00,
      category: '餐饮',
      remark: '午餐',
      date: '2026-06-07'
    }
  },
  success: res => {
    console.log('添加成功', res)
  },
  fail: err => {
    console.error('添加失败', err)
  }
})
```

#### 直接操作数据库

```javascript
const db = wx.cloud.database()

// 添加数据
db.collection('records').add({
  data: {
    type: 'expense',
    amount: 45.00,
    category: '餐饮'
  }
})

// 查询数据
db.collection('records')
  .where({ type: 'expense' })
  .orderBy('date', 'desc')
  .limit(20)
  .get()
```

### 5. 样式规范

#### 颜色系统

| 颜色 | 用途 | 值 |
|------|------|-----|
| 主题蓝 | 主要按钮、选中状态 | `#0052d9` |
| 收入绿 | 收入金额 | `#07c160` |
| 支出红 | 支出金额 | `#fa5151` |
| 背景灰 | 页面背景 | `#f5f5f5` |
| 文字深 | 主要文字 | `#333333` |
| 文字浅 | 次要文字 | `#666666` |

#### 单位规范

- 使用 `rpx` 作为尺寸单位（1rpx = 0.5px）
- 字体大小：28rpx（正文）、32rpx（标题）、24rpx（注释）
- 间距：20rpx（小）、30rpx（中）、40rpx（大）

---

## 🔄 开发工作流

### Git 分支策略

```
main (生产分支)
  ↑
develop (开发分支)
  ↑
feature/xxx (功能分支)
```

#### 常用命令

```bash
# 创建功能分支
git checkout -b feature/add-record

# 开发完成后合并到 develop
git checkout develop
git merge feature/add-record

# 发布时合并到 main
git checkout main
git merge develop
```

### 提交规范

使用语义化提交信息：

```
feat: 添加记账功能
fix: 修复金额显示问题
docs: 更新开发文档
style: 调整页面样式
refactor: 重构云函数逻辑
```

### 多终端同步

项目通过 GitHub 进行多终端同步：

1. **首次克隆**：
   ```bash
   git clone <repo-url>
   cd bill-mini-program
   npm install
   ```

2. **日常开发**：
   ```bash
   # 开始开发前
   git pull origin develop

   # 开发完成后
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/xxx
   ```

3. **切换设备**：
   ```bash
   # 拉取最新代码
   git pull origin develop

   # 安装依赖
   npm install

   # 在微信开发者工具中重新构建 npm
   ```

---

## 🧪 测试指南

### 本地测试

1. **模拟器测试**：在微信开发者工具中点击「编译」
2. **真机预览**：点击工具栏的「预览」按钮，扫码在真机上测试
3. **远程调试**：点击「远程调试」，在真机上调试

### 测试检查清单

- [ ] 所有页面正常加载
- [ ] 记账功能正常（添加、编辑、删除）
- [ ] 统计数据正确
- [ ] 分类管理正常
- [ ] 预算功能正常
- [ ] 用户信息获取正常
- [ ] 云函数调用正常
- [ ] 样式在不同屏幕尺寸下正常

---

## 🚀 发布流程

### 1. 代码审查

- 检查是否有 `console.log` 调试代码
- 检查是否有硬编码的测试数据
- 确保所有功能正常

### 2. 上传代码

在微信开发者工具中：
1. 点击工具栏的「上传」按钮
2. 填写版本号（如 `1.0.0`）
3. 填写更新说明

### 3. 提交审核

1. 登录微信公众平台
2. 进入「版本管理」
3. 选择刚上传的版本，点击「提交审核」
4. 填写审核信息，等待审核通过

### 4. 发布上线

审核通过后：
1. 在「版本管理」中点击「发布」
2. 选择发布范围（全量或灰度）
3. 确认发布

---

## 📚 参考资料

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [TDesign 小程序组件库](https://tdesign.tencent.com/miniprogram/overview)
- [微信小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)

---

## ❓ 常见问题

### Q: Tab 图标不显示？

A: 检查 `images/tab/` 目录下是否有对应的 PNG 图标文件。详见 `images/tab/README.md`。

### Q: 云函数调用失败？

A: 检查以下几点：
1. 云开发是否已开通
2. 云环境 ID 是否正确
3. 云函数是否已部署
4. 网络是否正常

### Q: TDesign 组件样式异常？

A: 确保：
1. 已执行 `npm install`
2. 已在微信开发者工具中「构建 npm」
3. 已勾选「ES6 转 ES5」
4. `app.json` 中没有 `"style": "v2"`

### Q: 数据不显示？

A: 检查：
1. 云数据库集合是否已创建
2. 数据权限是否正确（建议设置为「仅创建者可读写」）
3. 是否有测试数据

---

## 📝 更新日志

### v1.0.0 (2026-06-07)
- 初始版本发布
- 实现基本记账功能
- 实现统计图表
- 实现分类管理
- 实现预算管理
- 集成云开发
- 集成 TDesign 组件库

---

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: 添加新功能'`)
4. 推送到分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 📄 许可证

MIT License
