/**
 * Git LFS 视频自动加载器 - 优化版
 * 针对 Git LFS 大文件的专用加载策略
 * 支持 GitHub Media URL + 多种加速方案
 */

(function() {
    'use strict';
    
    // GitHub 仓库配置
    const LFS_CONFIG = {
        owner: 'QiqiTaotao666',
        repo: 'QiqiTaotao666.github.io',
        branch: 'main'
    };
    
    // LFS 文件专用 CDN 源配置（按优先级排序）
    // 注意：jsDelivr 不支持 LFS 文件，会返回指针文件内容
    const CDN_SOURCES = [
        // GitHub Media - LFS 文件的唯一正确来源
        {
            name: 'GitHub-Media',
            getUrl: (path) => `https://media.githubusercontent.com/media/${LFS_CONFIG.owner}/${LFS_CONFIG.repo}/${LFS_CONFIG.branch}/${path}`,
            supportsLFS: true
        },
        // GitHub Raw - 仅适用于非 LFS 文件
        {
            name: 'GitHub-Raw',
            getUrl: (path) => `https://raw.githubusercontent.com/${LFS_CONFIG.owner}/${LFS_CONFIG.repo}/${LFS_CONFIG.branch}/${path}`,
            supportsLFS: false
        },
        // jsDelivr - 仅适用于非 LFS 文件（LFS 文件会返回指针）
        {
            name: 'jsDelivr',
            getUrl: (path) => `https://cdn.jsdelivr.net/gh/${LFS_CONFIG.owner}/${LFS_CONFIG.repo}@${LFS_CONFIG.branch}/${path}`,
            supportsLFS: false
        }
    ];
    
    // 预连接到服务器（加速首次请求）
    function addPreconnect() {
        const domains = [
            'https://media.githubusercontent.com',  // LFS 文件主要来源
            'https://raw.githubusercontent.com',
            'https://cdn.jsdelivr.net'
        ];
        
        domains.forEach(domain => {
            // DNS 预解析
            const dnsPrefetch = document.createElement('link');
            dnsPrefetch.rel = 'dns-prefetch';
            dnsPrefetch.href = domain;
            document.head.appendChild(dnsPrefetch);
            
            // 预连接
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
        });
        
        console.log('🔗 已添加预连接（GitHub Media 优先）');
    }
    
    // 检测是否在 GitHub Pages 上运行
    function isGitHubPages() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname.includes('githubusercontent.com');
    }
    
    // 创建加载状态指示器
    function createLoadingIndicator(video) {
        const container = video.closest('.video-container');
        if (!container || container.querySelector('.cdn-loading')) return null;
        
        const indicator = document.createElement('div');
        indicator.className = 'cdn-loading';
        indicator.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px; 
                        background: rgba(0,0,0,0.7); color: #00d9ff; 
                        padding: 5px 10px; border-radius: 4px; font-size: 12px;
                        z-index: 10; transition: opacity 0.3s;">
                <span class="cdn-name">🚀 CDN加载中...</span>
            </div>
        `;
        container.style.position = 'relative';
        container.appendChild(indicator);
        return indicator;
    }
    
    // 更新加载状态
    function updateLoadingStatus(video, cdnName, success) {
        const container = video.closest('.video-container');
        if (!container) return;
        
        const indicator = container.querySelector('.cdn-loading');
        if (indicator) {
            const nameEl = indicator.querySelector('.cdn-name');
            if (success) {
                nameEl.textContent = `✅ ${cdnName}`;
                nameEl.style.color = '#00ff88';
                setTimeout(() => {
                    indicator.style.opacity = '0';
                    setTimeout(() => indicator.remove(), 300);
                }, 2000);
            } else {
                nameEl.textContent = `⏳ 尝试 ${cdnName}...`;
                nameEl.style.color = '#ffaa00';
            }
        }
    }
    
    // 增强单个视频元素
    function enhanceVideoElement(video) {
        if (video.dataset.cdnEnhanced) return;
        video.dataset.cdnEnhanced = 'true';
        
        const sources = video.querySelectorAll('source');
        if (sources.length === 0) return;
        
        // 创建加载指示器
        createLoadingIndicator(video);
        
        // 收集所有原始源
        const originalSources = [];
        sources.forEach(source => {
            const src = source.getAttribute('src');
            if (src && src.includes('videos/') && !src.startsWith('http')) {
                originalSources.push({
                    path: src.replace(/^\.?\//, ''),
                    type: source.type || 'video/mp4'
                });
            }
        });
        
        if (originalSources.length === 0) return;
        
        // 清空现有源
        sources.forEach(s => s.remove());
        
        // 为 LFS 文件添加源（只使用支持 LFS 的源）
        originalSources.forEach(original => {
            // 首先添加支持 LFS 的源（GitHub Media）
            CDN_SOURCES.filter(cdn => cdn.supportsLFS).forEach(cdn => {
                const newSource = document.createElement('source');
                newSource.src = cdn.getUrl(original.path);
                newSource.type = original.type;
                newSource.dataset.cdnName = cdn.name;
                video.appendChild(newSource);
            });
            
            // 然后添加其他源作为备选（可能不支持 LFS）
            CDN_SOURCES.filter(cdn => !cdn.supportsLFS).forEach(cdn => {
                const newSource = document.createElement('source');
                newSource.src = cdn.getUrl(original.path);
                newSource.type = original.type;
                newSource.dataset.cdnName = cdn.name;
                video.appendChild(newSource);
            });
            
            // 最后添加本地源作为最终回退
            const localSource = document.createElement('source');
            localSource.src = original.path;
            localSource.type = original.type;
            localSource.dataset.cdnName = 'Local';
            video.appendChild(localSource);
        });
        
        console.log(`🎬 LFS视频已配置 GitHub Media 优先加载`);
        
        // 当前尝试的源索引
        let currentSourceIndex = 0;
        const allSources = video.querySelectorAll('source');
        
        // 成功加载
        video.addEventListener('loadeddata', function() {
            const currentSource = allSources[currentSourceIndex];
            if (currentSource) {
                const cdnName = currentSource.dataset.cdnName;
                console.log(`✅ 视频加载成功: ${cdnName}`);
                updateLoadingStatus(video, cdnName, true);
            }
        });
        
        // 错误处理 - 自动切换到下一个源
        video.addEventListener('error', function(e) {
            const failedSource = allSources[currentSourceIndex];
            if (failedSource) {
                console.warn(`⚠️ ${failedSource.dataset.cdnName} 加载失败，尝试下一个源`);
                updateLoadingStatus(video, failedSource.dataset.cdnName, false);
            }
            
            currentSourceIndex++;
            if (currentSourceIndex < allSources.length) {
                const nextSource = allSources[currentSourceIndex];
                updateLoadingStatus(video, nextSource.dataset.cdnName, false);
                
                // 设置新源并重新加载
                video.src = nextSource.src;
                video.load();
            } else {
                console.error('❌ 所有视频源都加载失败');
                updateLoadingStatus(video, '加载失败', false);
            }
        }, true);
        
        // 重新加载视频
        video.load();
    }
    
    // 增强页面中所有视频
    function enhanceAllVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(enhanceVideoElement);
        console.log(`✅ 已增强 ${videos.length} 个视频元素（LFS 专用）`);
    }
    
    // 初始化
    function init() {
        addPreconnect();
        enhanceAllVideos();
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
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
    
    console.log('🎥 Git LFS 视频加载器已初始化（GitHub Media 优先）');
})();
