/**
 * Git LFS 视频自动加载器
 * 自动将 LFS 管理的视频转换为正确的 GitHub Media URL
 */

(function() {
    'use strict';
    
    // GitHub 仓库配置
    const LFS_CONFIG = {
        owner: 'QiqiTaotao666',
        repo: 'QiqiTaotao666.github.io',
        branch: 'main'
    };
    
    // 生成 GitHub LFS Media URL
    function getLfsMediaUrl(videoPath) {
        // 移除开头的 ./ 或 /
        const cleanPath = videoPath.replace(/^\.?\//, '');
        return `https://media.githubusercontent.com/media/${LFS_CONFIG.owner}/${LFS_CONFIG.repo}/${LFS_CONFIG.branch}/${cleanPath}`;
    }
    
    // 检测是否在 GitHub Pages 上运行
    function isGitHubPages() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname.includes('githubusercontent.com');
    }
    
    // 增强单个视频元素
    function enhanceVideoElement(video) {
        const sources = video.querySelectorAll('source');
        if (sources.length === 0) return;
        
        const existingSrcs = new Set();
        sources.forEach(s => existingSrcs.add(s.src));
        
        sources.forEach(source => {
            const originalSrc = source.getAttribute('src');
            if (!originalSrc || !originalSrc.includes('videos/')) return;
            
            // 如果已经是完整 URL，跳过
            if (originalSrc.startsWith('http')) return;
            
            const lfsUrl = getLfsMediaUrl(originalSrc);
            
            // 检查是否已经有 LFS URL
            if (existingSrcs.has(lfsUrl)) return;
            
            // 创建新的 source 元素并插入到最前面
            const lfsSource = document.createElement('source');
            lfsSource.src = lfsUrl;
            lfsSource.type = 'video/mp4';
            
            // 将 LFS URL 作为首选源插入
            video.insertBefore(lfsSource, video.firstChild);
            
            console.log(`🎬 LFS视频增强: ${originalSrc} → ${lfsUrl}`);
        });
        
        // 添加错误处理和自动回退
        video.addEventListener('error', function(e) {
            const currentSource = video.querySelector('source');
            if (currentSource) {
                console.warn(`⚠️ 视频加载失败，尝试下一个源: ${currentSource.src}`);
                currentSource.remove();
                video.load();
            }
        }, true);
    }
    
    // 增强页面中所有视频
    function enhanceAllVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(enhanceVideoElement);
        console.log(`✅ 已增强 ${videos.length} 个视频元素`);
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceAllVideos);
    } else {
        enhanceAllVideos();
    }
    
    // 监听动态添加的视频
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeName === 'VIDEO') {
                    enhanceVideoElement(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('video').forEach(enhanceVideoElement);
                }
            });
        });
    });
    
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('🎥 Git LFS 视频加载器已初始化');
})();
