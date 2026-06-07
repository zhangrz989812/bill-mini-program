# Tab 图标说明

本目录需要以下 8 个图标文件（PNG 格式，建议 81x81 像素）：

## 必需图标

| 文件名 | 说明 | 状态 |
|--------|------|------|
| home.png | 首页图标（未选中） | ❌ 缺失 |
| home-active.png | 首页图标（选中） | ❌ 缺失 |
| statistics.png | 统计图标（未选中） | ❌ 缺失 |
| statistics-active.png | 统计图标（选中） | ❌ 缺失 |
| category.png | 分类图标（未选中） | ❌ 缺失 |
| category-active.png | 分类图标（选中） | ❌ 缺失 |
| profile.png | 我的图标（未选中） | ❌ 缺失 |
| profile-active.png | 我的图标（选中） | ❌ 缺失 |

## 图标规范

- **格式**：PNG（支持透明背景）
- **尺寸**：81x81 像素（推荐）
- **未选中颜色**：#999999（灰色）
- **选中颜色**：#0052d9（主题蓝）

## 获取图标

### 方案 1：使用微信官方图标库
访问 https://developers.weixin.qq.com/miniprogram/dev/reference/

### 方案 2：使用 Iconfont
1. 访问 https://www.iconfont.cn/
2. 搜索需要的图标
3. 下载 PNG 格式，调整为 81x81 像素

### 方案 3：使用 TDesign 图标
TDesign 提供了丰富的图标组件，可以在代码中直接使用：
```json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

```html
<t-icon name="home" size="48rpx" />
```

## 临时解决方案

如果暂时没有图标文件，可以在 `app.json` 中注释掉 `tabBar` 配置，使用自定义 tabBar 组件。
