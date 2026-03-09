/**
 * LFS 视频 URL 转换工具
 * 自动将视频路径转换为合适的加载方式
 */

const LFS_VIDEO_CONFIG = {
    // GitHub 仓库配置
    owner: 'QiqiTaotao666',
    repo: 'QiqiTaotao666.github.io',
    branch: 'main',
    
    // 文件大小阈值（MB）
    thresholds: {
        direct: 25,      // 小于 25MB: 直接托管
        jsdelivr: 50,    // 25-50MB: 使用 jsDelivr
        githubMedia: 2048 // 50MB-2GB: 使用 GitHub Media
    }
};

/**
 * 根据文件大小生成最佳 URL
 * @param {string} videoPath - 视频相对路径（如 'videos/bodian.mp4'）
 * @param {number} sizeMB - 文件大小（MB）
 * @returns {string} - 最佳视频 URL
 */
function getOptimalVideoUrl(videoPath, sizeMB) {
    const { owner, repo, branch, thresholds } = LFS_VIDEO_CONFIG;
    
    // 方案 1: 直接托管（< 25MB）
    if (sizeMB < thresholds.direct) {
        return videoPath;
    }
    
    // 方案 2: jsDelivr CDN（25-50MB）
    if (sizeMB < thresholds.jsdelivr) {
        return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${videoPath}`;
    }
    
    // 方案 3: GitHub Media URL（50MB-2GB）
    return `https://media.githubusercontent.com/media/${owner}/${repo}/${branch}/${videoPath}`;
}

/**
 * 创建带自动回退的视频元素
 * @param {string} videoPath - 视频路径
 * @param {number} sizeMB - 文件大小
 * @returns {HTMLVideoElement}
 */
function createRobustVideoElement(videoPath, sizeMB) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    
    // 主要源
    const primaryUrl = getOptimalVideoUrl(videoPath, sizeMB);
    const source1 = document.createElement('source');
    source1.src = primaryUrl;
    source1.type = 'video/mp4';
    video.appendChild(source1);
    
    // 备用源 1: jsDelivr
    if (sizeMB >= 25) {
        const { owner, repo, branch } = LFS_VIDEO_CONFIG;
        const source2 = document.createElement('source');
        source2.src = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${videoPath}`;
        source2.type = 'video/mp4';
        video.appendChild(source2);
    }
    
    // 备用源 2: GitHub Media
    if (sizeMB >= 25) {
        const { owner, repo, branch } = LFS_VIDEO_CONFIG;
        const source3 = document.createElement('source');
        source3.src = `https://media.githubusercontent.com/media/${owner}/${repo}/${branch}/${videoPath}`;
        source3.type = 'video/mp4';
        video.appendChild(source3);
    }
    
    // 备用源 3: 直接路径（作为最后的尝试）
    if (sizeMB >= 25) {
        const source4 = document.createElement('source');
        source4.src = videoPath;
        source4.type = 'video/mp4';
        video.appendChild(source4);
    }
    
    return video;
}

/**
 * 自动替换页面中的所有视频元素
 */
function enhanceAllVideos() {
    // 视频文件大小映射（手动维护或通过 API 获取）
    const videoSizes = {
        'videos/bodian.mp4': 1.2,
        'videos/bodian2.mp4': 0.8,
        'videos/meimanche.mp4': 52.5,
        'videos/dengat/boss战演示.mp4': 652,
        'videos/media13/shijiechangjing.mp4': 90,
        // 添加更多视频...
    };
    
    document.querySelectorAll('video').forEach(video => {
        const source = video.querySelector('source');
        if (source) {
            const originalPath = source.getAttribute('src');
            const sizeMB = videoSizes[originalPath] || 10; // 默认假设 10MB
            
            // 如果是大文件，添加多个源
            if (sizeMB >= 25) {
                // 清空现有源
                video.innerHTML = '';
                
                // 创建多个备用源
                const urls = [
                    getOptimalVideoUrl(originalPath, sizeMB),
                    `https://cdn.jsdelivr.net/gh/${LFS_VIDEO_CONFIG.owner}/${LFS_VIDEO_CONFIG.repo}@${LFS_VIDEO_CONFIG.branch}/${originalPath}`,
                    `https://media.githubusercontent.com/media/${LFS_VIDEO_CONFIG.owner}/${LFS_VIDEO_CONFIG.repo}/${LFS_VIDEO_CONFIG.branch}/${originalPath}`,
                    originalPath
                ];
                
                urls.forEach(url => {
                    const newSource = document.createElement('source');
                    newSource.src = url;
                    newSource.type = 'video/mp4';
                    video.appendChild(newSource);
                });
                
                console.log(`✅ 增强视频: ${originalPath} (${sizeMB}MB) - 添加了 ${urls.length} 个备用源`);
            }
        }
    });
}

/**
 * 页面加载完成后自动执行
 */
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🎥 LFS 视频增强工具已启动');
        enhanceAllVideos();
    });
}

// 导出供 Node.js 使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getOptimalVideoUrl,
        createRobustVideoElement,
        enhanceAllVideos,
        LFS_VIDEO_CONFIG
    };
}
