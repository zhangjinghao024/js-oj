# 设置浏览器标签页图标

## 需求概述

为前端项目配置自定义的浏览器标签页图标(favicon),替换当前默认的 Vite SVG 图标。

## 当前状态

项目当前使用的是 Vite 默认图标:
- 在 `index.html` 第 5 行配置: `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`
- 引用的是 `/vite.svg` 文件
- 项目根目录下没有 `public` 文件夹

## 设计方案

### 图标文件位置

浏览器标签页图标应放置在以下两个位置之一:

**方案一:放置在 public 目录(推荐)**
- 在项目根目录创建 `public` 文件夹
- 将图标文件放入 `public` 目录
- Vite 会自动将 `public` 目录下的文件复制到构建输出的根目录

**方案二:放置在项目根目录**
- 直接将图标文件放在与 `index.html` 同级的根目录
- 适用于只有少量静态资源的情况

### 图标文件格式

支持的图标格式包括:

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| `.ico` | 兼容性最好,支持多尺寸 | 文件较大 | 需要支持旧版浏览器 |
| `.png` | 清晰度高,广泛支持 | 单一尺寸 | 现代浏览器,需要高清图标 |
| `.svg` | 矢量图,任意缩放不失真 | 部分旧浏览器不支持 | 现代浏览器,简洁图标 |

### HTML 配置方式

在 `index.html` 的 `<head>` 标签内配置图标链接:

**单一图标配置:**

修改第 5 行的 `<link>` 标签,根据图标格式选择对应的配置:

- SVG 格式: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- PNG 格式: `<link rel="icon" type="image/png" href="/favicon.png" />`
- ICO 格式: `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`

**多尺寸图标配置(推荐):**

为不同设备提供不同尺寸的图标以获得最佳显示效果:

```
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### 推荐图标尺寸

| 图标类型 | 尺寸 | 用途 |
|----------|------|------|
| favicon.ico | 16x16, 32x32, 48x48 (多尺寸合并) | 浏览器标签页,书签栏 |
| favicon-16x16.png | 16x16 | 浏览器标签页 |
| favicon-32x32.png | 32x32 | 浏览器标签页(高分辨率) |
| apple-touch-icon.png | 180x180 | iOS 设备主屏幕图标 |

## 实施步骤

1. **准备图标文件**
   - 设计或获取符合项目主题的图标
   - 准备所需格式和尺寸的图标文件

2. **创建目录结构**
   - 在项目根目录创建 `public` 文件夹(如果选择方案一)
   - 将图标文件放入相应位置

3. **修改 HTML 配置**
   - 打开 `index.html` 文件
   - 在 `<head>` 标签内修改或添加 `<link rel="icon">` 标签
   - 确保 `href` 路径正确指向图标文件

4. **验证效果**
   - 重启开发服务器
   - 在浏览器中访问应用
   - 检查浏览器标签页是否显示新图标
   - 清除浏览器缓存后再次验证

## 注意事项

- **路径规则**: `public` 目录中的文件在引用时路径以 `/` 开头,表示从输出根目录引用
- **缓存问题**: 浏览器会缓存 favicon,修改后可能需要清除缓存或强制刷新才能看到变化
- **文件命名**: 建议使用 `favicon` 作为文件名前缀,符合行业惯例
- **构建输出**: Vite 构建时会自动将 `public` 目录的内容复制到 `dist` 目录
- **开发环境**: 修改图标后需要重启 Vite 开发服务器才能生效
