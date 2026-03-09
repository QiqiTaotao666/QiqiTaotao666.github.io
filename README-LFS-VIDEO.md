# Git LFS 视频播放解决方案

## 🎯 问题

Git LFS 将大文件替换为 132 字节的指针文件，导致视频无法在网页上播放。

## ✅ 解决方案

### 方案 1: GitHub Media URL（推荐）⭐

**适用场景**：LFS 管理的任何大小文件

**URL 格式**：
```
https://media.githubusercontent.com/media/用户名/仓库名/分支名/文件路径
```

**示例**：
```html
<video controls>
    <source src="https://media.githubusercontent.com/media/QiqiTaotao666/QiqiTaotao666.github.io/main/videos/bodian.mp4" 
            type="video/mp4">
</video>
```

**优点**：
- ✅ 直接访问 LFS 服务器上的真实文件
- ✅ 支持大文件（最大 2GB）
- ✅ 无需修改 Git 配置
- ✅ 自动使用 GitHub CDN

**限制**：
- ⚠️ 免费账户：1GB 带宽/月
- ⚠️ 需要文件已正确上传到 LFS

---

### 方案 2: jsDelivr CDN

**适用场景**：小于 50MB 的文件

**URL 格式**：
```
https://cdn.jsdelivr.net/gh/用户名/仓库名@分支名/文件路径
```

**示例**：
```html
<video controls>
    <source src="https://cdn.jsdelivr.net/gh/QiqiTaotao666/QiqiTaotao666.github.io@main/videos/bodian.mp4" 
            type="video/mp4">
</video>
```

**优点**：
- ✅ 完全免费
- ✅ 全球 CDN 加速
- ✅ 自动处理 LFS 文件
- ✅ 无需配置

**限制**：
- ⚠️ 单文件最大 50MB
- ⚠️ 首次访问需要 CDN 缓存（较慢）

---

### 方案 3: 多源回退策略（最稳定）⭐⭐⭐

**为同一个视频提供多个备用源，浏览器会自动尝试**

```html
<video controls>
    <!-- 主要源: GitHub Media URL -->
    <source src="https://media.githubusercontent.com/media/QiqiTaotao666/QiqiTaotao666.github.io/main/videos/large-video.mp4" 
            type="video/mp4">
    
    <!-- 备用源 1: jsDelivr CDN -->
    <source src="https://cdn.jsdelivr.net/gh/QiqiTaotao666/QiqiTaotao666.github.io@main/videos/large-video.mp4" 
            type="video/mp4">
    
    <!-- 备用源 2: 直接路径（如果文件小于 25MB）-->
    <source src="videos/large-video.mp4" 
            type="video/mp4">
    
    您的浏览器不支持视频播放
</video>
```

**工作原理**：
1. 浏览器首先尝试加载第一个 `<source>`
2. 如果失败，自动尝试第二个
3. 依次类推，直到成功或全部失败

---

### 方案 4: 自动化工具（最方便）

**使用 `lfs-video-helper.js` 自动处理**

#### 1. 在 HTML 中引入脚本：

```html
<head>
    <!-- 其他标签 -->
    <script src="lfs-video-helper.js"></script>
</head>
```

#### 2. 脚本会自动增强页面中的所有视频

**或手动创建视频元素**：

```javascript
// 创建带多个备用源的视频元素
const video = createRobustVideoElement('videos/large-video.mp4', 100); // 100MB
document.getElementById('container').appendChild(video);
```

---

## 📊 方案对比

| 方案 | 难度 | 速度 | 费用 | 文件大小限制 | 推荐指数 |
|------|------|------|------|-------------|---------|
| GitHub Media URL | ⭐ 简单 | ⭐⭐⭐ 快 | 免费（1GB/月） | 2GB | ⭐⭐⭐⭐⭐ |
| jsDelivr CDN | ⭐ 最简单 | ⭐⭐⭐⭐ 很快 | 完全免费 | 50MB | ⭐⭐⭐⭐ |
| 多源回退 | ⭐⭐ 简单 | ⭐⭐⭐⭐ 很快 | 免费 | 无限制 | ⭐⭐⭐⭐⭐ |
| 自动化工具 | ⭐ 最简单 | ⭐⭐⭐⭐ 很快 | 免费 | 无限制 | ⭐⭐⭐⭐⭐ |
| 直接托管 | ⭐ 简单 | ⭐⭐⭐ 快 | 免费 | 25MB (Cloudflare) | ⭐⭐⭐ |

---

## 🚀 快速开始

### 步骤 1: 下载工具文件

将以下文件添加到你的项目：
- `lfs-video-helper.js` - 自动化工具
- `lfs-example.html` - 使用示例
- `lfs-video-demo.html` - 完整演示

### 步骤 2: 修改现有页面

在需要播放 LFS 视频的页面中：

```html
<head>
    <!-- 添加这一行 -->
    <script src="lfs-video-helper.js"></script>
</head>
```

### 步骤 3: 更新视频配置

编辑 `lfs-video-helper.js`，修改仓库信息：

```javascript
const LFS_VIDEO_CONFIG = {
    owner: '你的GitHub用户名',
    repo: '你的仓库名',
    branch: 'main', // 或 'master'
    // ...
};
```

### 步骤 4: 测试

访问 `lfs-example.html` 查看效果！

---

## 📝 针对不同文件大小的建议

### 小文件（< 25MB）
```html
<!-- 直接使用相对路径 -->
<video controls>
    <source src="videos/small-video.mp4" type="video/mp4">
</video>
```

### 中等文件（25-50MB）
```html
<!-- 使用 jsDelivr CDN -->
<video controls>
    <source src="https://cdn.jsdelivr.net/gh/用户名/仓库名@main/videos/medium-video.mp4" type="video/mp4">
    <source src="videos/medium-video.mp4" type="video/mp4">
</video>
```

### 大文件（50MB-2GB）
```html
<!-- 使用 GitHub Media URL + 备用源 -->
<video controls>
    <source src="https://media.githubusercontent.com/media/用户名/仓库名/main/videos/large-video.mp4" type="video/mp4">
    <source src="https://cdn.jsdelivr.net/gh/用户名/仓库名@main/videos/large-video.mp4" type="video/mp4">
</video>
```

---

## 🔍 常见问题

### Q: 如何知道文件是否在 LFS 中？

```bash
git lfs ls-files
```

### Q: 如何将文件上传到 LFS？

```bash
git lfs track "*.mp4"
git add .gitattributes
git add videos/
git commit -m "Add videos to LFS"
git lfs push --all origin main
```

### Q: 视频仍然无法播放？

检查：
1. 文件是否已正确上传到 LFS（访问 GitHub Media URL 看是否返回 200）
2. 浏览器控制台是否有错误
3. 尝试多源回退策略

---

## 📚 相关文件

- `lfs-video-helper.js` - 自动化工具脚本
- `lfs-example.html` - 实用示例（推荐查看）
- `lfs-video-demo.html` - 完整方案演示
- `README-LFS-VIDEO.md` - 本文档

---

## 🎉 总结

**最佳实践**：

1. **小文件直接托管**：修改 `.gitattributes`，移除 LFS 追踪
2. **大文件用多源回退**：GitHub Media + jsDelivr + 直接路径
3. **使用自动化工具**：`lfs-video-helper.js` 一键增强

**一句话建议**：使用方案 3（多源回退策略）+ 方案 4（自动化工具）= 最稳定可靠的解决方案！ 🚀
