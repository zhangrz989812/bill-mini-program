# 记账本小程序 - 项目备忘

## 项目概况
- 微信小程序 + 云开发（CloudBase）的个人记账本
- 工作区：D:\AI\workspace\bill
- AppID：待配置（当前为占位符 `your-appid-here`）
- 云环境：待配置（当前为占位符 `your-env-id`）
- 6 个页面：首页、记账、统计、分类、预算、我的

## 必须调用的 Skills
用户明确要求在本项目对话中始终使用以下四个 skill：
1. **腾讯云CloudBase** - 云开发相关（数据库、云函数、鉴权）
2. **微信小程序开发框架** - 小程序基础开发
3. **Skyline渲染引擎** - 渲染引擎相关
4. **TDesign微信小程序组件** - UI 组件库

## 已修复问题（2026-06-07）
- ✅ 创建 sitemap.json
- ✅ 创建 app.wxss（全局样式）
- ✅ 创建 utils/format.wxs（WXS 格式化工具）
- ✅ 修复所有 WXML 中的 .toFixed(2) 调用
- ✅ 修复废弃的 wx.getUserInfo API
- ✅ 创建 cloud/index.js（云函数模板）
- ✅ 创建 .gitignore
- ✅ 编写详细开发文档 DEVELOPMENT.md

## 待完成事项
- [ ] 获取 AppID 并配置
- [ ] 开通云开发并配置环境 ID
- [ ] 创建 Tab 图标文件（8 个 PNG）
- [ ] 安装 TDesign 依赖（npm install）
- [ ] 创建云数据库集合（records、categories、budgets）
- [ ] 将模拟数据替换为真实云函数调用

## 开发规范
- 多终端开发通过 GitHub 同步
- 使用 Git 分支策略：main → develop → feature/xxx
- 提交信息使用语义化格式（feat/fix/docs/style/refactor）
