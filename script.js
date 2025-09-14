// === 现代化 Markdown 编辑器主逻辑 ===
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // === DOM 元素获取 ===
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const lineNumbers = document.getElementById('lineNumbers');
    const mainContent = document.querySelector('.main-content');
    const divider = document.getElementById('divider');

    // 工具栏按钮
    const saveBtn = document.getElementById('saveBtn');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const toggleEditorBtn = document.getElementById('toggleEditorBtn');
    const togglePreviewBtn = document.getElementById('togglePreviewBtn');
    const mdGuideBtn = document.getElementById('mdGuideBtn');
    const clearBtn = document.getElementById('clearBtn');
    const wordCountBtn = document.getElementById('wordCountBtn');
    const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    const exportToggle = document.getElementById('exportToggle');
    const themeToggle = document.getElementById('themeToggle');
    const moreOptions = document.getElementById('moreOptions');

    // 主题选择器
    const themeSelector = document.getElementById('themeSelector');

    // 下拉菜单
    const exportMenu = document.getElementById('exportMenu');

    // 状态栏元素
    const wordCount = document.getElementById('wordCount');
    const lineCount = document.getElementById('lineCount');
    const cursorPosition = document.getElementById('cursorPosition');

    // === 状态变量 ===
    let isAutoSaveEnabled = true;
    let autoSaveTimer = null;
    let isShowingGuide = false;
    let userContentBeforeGuide = '';
    let currentTheme = 'light';

    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.md,.markdown,text/markdown';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // === 初始化设置 ===

    // 配置 marked 选项
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            sanitize: false,
            silent: true,
            smartLists: true,
            smartypants: false,
            xhtml: false
        });
    }

    // 初始化主题
    function initializeTheme() {
        const savedTheme = localStorage.getItem('markdown-theme') || 'light';
        currentTheme = savedTheme;
        document.body.className = `theme-${savedTheme}`;
        themeSelector.value = savedTheme;
    }

    // === 核心功能函数 ===

    // 渲染 Markdown
    function renderMarkdown(shouldSave = true) {
        try {
            const markdownText = editor.value;
            let htmlContent = '';

            if (typeof marked !== 'undefined') {
                htmlContent = marked.parse(markdownText);
            } else {
                // 如果 marked 未加载，使用简单的文本显示
                htmlContent = `<pre>${markdownText}</pre>`;
            }

            preview.innerHTML = htmlContent;

            // 更新行号
            updateLineNumbers();

            // 更新统计信息
            updateStats();

            // 自动保存
            if (shouldSave && isAutoSaveEnabled && !isShowingGuide) {
                scheduleAutoSave();
            }
        } catch (error) {
            console.error('渲染 Markdown 时出错:', error);
            preview.innerHTML = `<div style="color: var(--error); padding: 20px;">渲染错误: ${error.message}</div>`;
        }
    }

    // 更新行号显示
    function updateLineNumbers() {
        const lines = editor.value.split('\n');
        const lineCount = lines.length;
        let lineNumbersHtml = '';

        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHtml += `${i}\n`;
        }

        lineNumbers.textContent = lineNumbersHtml;

        // 同步滚动
        syncScroll();
    }

    // 同步编辑器和行号的滚动
    function syncScroll() {
        const scrollTop = editor.scrollTop;
        lineNumbers.scrollTop = scrollTop;
    }

    // 更新统计信息
    function updateStats() {
        const text = editor.value;

        // 字数统计（中文字符 + 英文单词）
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        const totalWords = chineseChars + englishWords;

        // 行数
        const lines = text.split('\n').length;

        // 光标位置
        const cursorPos = editor.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const currentLine = textBeforeCursor.split('\n').length;
        const currentColumn = textBeforeCursor.split('\n').pop().length + 1;

        // 更新显示
        wordCount.textContent = totalWords.toLocaleString();
        lineCount.textContent = lines.toLocaleString();
        cursorPosition.textContent = `${currentLine},${currentColumn}`;
        wordCountBtn.textContent = `字数: ${totalWords.toLocaleString()}`;
    }

    // 计划自动保存
    function scheduleAutoSave() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        autoSaveTimer = setTimeout(() => {
            saveToStorage();
        }, 1000); // 1秒后自动保存
    }

    // 保存到本地存储
    function saveToStorage() {
        try {
            localStorage.setItem('markdown-content', editor.value);
            localStorage.setItem('markdown-theme', currentTheme);
            showNotification('已自动保存', 'success');
        } catch (error) {
            console.error('保存失败:', error);
            showNotification('保存失败', 'error');
        }
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        // 设置样式
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // 根据类型设置颜色
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--accent-color)'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.style.color = 'white';
        notification.style.boxShadow = 'var(--shadow-lg)';

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 获取文件名
    function getFilename() {
        const firstLine = editor.value.trim().split('\n')[0];
        const sanitized = firstLine.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-]/g, '').trim();
        return sanitized && sanitized.length > 0 ? sanitized : 'markdown-export';
    }

    // === 事件监听器 ===

    // 编辑器输入事件
    editor.addEventListener('input', () => {
        if (isShowingGuide) {
            isShowingGuide = false;
            mdGuideBtn.innerHTML = getIconSVG('help');
        }
        renderMarkdown(true);
    });

    // 编辑器滚动事件
    editor.addEventListener('scroll', syncScroll);

    // 编辑器光标位置变化事件
    editor.addEventListener('mouseup', updateStats);
    editor.addEventListener('keyup', updateStats);

    // 保存按钮
    saveBtn.addEventListener('click', () => {
        saveToStorage();
        showNotification('已保存到本地存储', 'success');
    });

    // 导入按钮
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                editor.value = e.target.result;
                if (isShowingGuide) {
                    isShowingGuide = false;
                    mdGuideBtn.innerHTML = getIconSVG('help');
                }
                renderMarkdown(true);
                showNotification('文件导入成功', 'success');
            } catch (error) {
                showNotification('文件导入失败', 'error');
            }
        };
        reader.onerror = () => {
            showNotification('文件读取失败', 'error');
        };
        reader.readAsText(file);
        fileInput.value = '';
    });

    // 导出 Markdown
    exportBtn.addEventListener('click', () => {
        try {
            const blob = new Blob([editor.value], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${getFilename()}.md`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            showNotification('Markdown 文件导出成功', 'success');
            closeAllDropdowns();
        } catch (error) {
            showNotification('导出失败', 'error');
        }
    });

    // 导出 HTML
    exportHtmlBtn.addEventListener('click', () => {
        try {
            const markdownText = editor.value;
            let htmlContent = '';

            // 解析 Markdown 为 HTML
            if (typeof marked !== 'undefined') {
                htmlContent = marked.parse(markdownText);
            } else {
                // 如果 marked 未加载，使用简单的文本显示
                htmlContent = `<pre>${markdownText}</pre>`;
            }

            // 创建完整的 HTML 页面
            const fullHtml = generateHtmlPage(htmlContent, getFilename());

            // 创建并下载文件
            const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${getFilename()}.html`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            showNotification('HTML 文件导出成功', 'success');
            closeAllDropdowns();
        } catch (error) {
            console.error('HTML导出失败:', error);
            showNotification('HTML导出失败', 'error');
        }
    });

    // 导出 PDF
    exportPdfBtn.addEventListener('click', async () => {
        if (typeof html2pdf === 'undefined') {
            showNotification('PDF 导出功能暂时不可用', 'error');
            return;
        }

        const btn = exportPdfBtn;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="loading"></div>';

        try {
            const element = document.getElementById('preview');
            const opt = {
                margin: [15, 15, 15, 15],
                filename: `${getFilename()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--app-bg')
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(element).set(opt).save();
            showNotification('PDF 导出成功', 'success');
        } catch (error) {
            console.error('PDF导出失败:', error);
            showNotification('PDF导出失败', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
            closeAllDropdowns();
        }
    });

    // 切换编辑器显示
    toggleEditorBtn.addEventListener('click', () => {
        const editorPanel = document.querySelector('.editor-panel');
        editorPanel.classList.toggle('hidden');

        if (editorPanel.classList.contains('hidden')) {
            toggleEditorBtn.style.opacity = '0.5';
        } else {
            toggleEditorBtn.style.opacity = '1';
        }

        showNotification(
            editorPanel.classList.contains('hidden') ? '编辑器已隐藏' : '编辑器已显示',
            'info'
        );
    });

    // 切换预览显示
    togglePreviewBtn.addEventListener('click', () => {
        const previewPanel = document.querySelector('.preview-panel');
        previewPanel.classList.toggle('hidden');

        if (previewPanel.classList.contains('hidden')) {
            togglePreviewBtn.style.opacity = '0.5';
        } else {
            togglePreviewBtn.style.opacity = '1';
        }

        showNotification(
            previewPanel.classList.contains('hidden') ? '预览已隐藏' : '预览已显示',
            'info'
        );
    });

    // Markdown 指南
    mdGuideBtn.addEventListener('click', () => {
        isShowingGuide = !isShowingGuide;

        if (isShowingGuide) {
            userContentBeforeGuide = editor.value;
            editor.value = getMarkdownGuide();
            mdGuideBtn.innerHTML = getIconSVG('edit');
            showNotification('Markdown 指南已加载', 'info');
        } else {
            editor.value = userContentBeforeGuide;
            mdGuideBtn.innerHTML = getIconSVG('help');
            showNotification('已返回编辑模式', 'info');
        }

        renderMarkdown(false);
    });

    // 清空编辑器
    clearBtn.addEventListener('click', () => {
        if (editor.value.trim() && confirm('确定要清空所有内容吗？此操作不可撤销。')) {
            editor.value = '';
            renderMarkdown(true);
            showNotification('编辑器已清空', 'info');
        }
    });

    // 刷新预览
    refreshPreviewBtn.addEventListener('click', () => {
        renderMarkdown(false);
        showNotification('预览已刷新', 'success');
    });

    // 主题切换
    themeSelector.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        applyTheme(newTheme);
    });

    themeToggle.addEventListener('click', () => {
        const themes = ['light', 'dark', 'blue', 'cyberpunk'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];

        themeSelector.value = nextTheme;
        applyTheme(nextTheme);
    });

    // 应用主题
    function applyTheme(theme) {
        currentTheme = theme;
        document.body.className = `theme-${theme}`;
        localStorage.setItem('markdown-theme', theme);
        showNotification(`已切换到${getThemeName(theme)}主题`, 'success');
    }

    // 获取主题名称
    function getThemeName(theme) {
        const names = {
            light: '浅色',
            dark: '深色',
            blue: '蓝色',
            cyberpunk: '赛博朋克'
        };
        return names[theme] || '未知';
    }

    // 导出菜单切换
    exportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(exportMenu);
    });

    // 更多选项
    moreOptions.addEventListener('click', () => {
        showNotification('更多功能开发中...', 'info');
    });

    // === 下拉菜单控制 ===
    function toggleDropdown(menu) {
        const isVisible = menu.classList.contains('show');
        closeAllDropdowns();

        if (!isVisible) {
            menu.classList.add('show');
        }
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });

    // === 优化后的分割线拖拽功能 ===
    class DividerDragOptimizer {
        constructor() {
            this.isDragging = false;
            this.startX = 0;
            this.startWidth = 0;
            this.editorPanel = null;
            this.previewPanel = null;
            this.mainContent = null;
            this.lastFrameTime = 0;
            this.frameInterval = 1000 / 60; // 60fps限制
            this.animationId = null;
            this.resizeObserver = null;
            this.cachedWidth = 0;

            this.init();
        }

        init() {
            this.editorPanel = document.querySelector('.editor-panel');
            this.previewPanel = document.querySelector('.preview-panel');
            this.mainContent = document.querySelector('.main-content');

            // 使用ResizeObserver缓存容器宽度
            this.resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    this.cachedWidth = entry.contentRect.width;
                }
            });
            this.resizeObserver.observe(this.mainContent);

            // 初始缓存
            this.cachedWidth = this.mainContent.offsetWidth;

            // 绑定事件监听器
            this.bindEvents();

            // 为分割线添加性能优化CSS
            divider.style.willChange = 'transform';
            this.editorPanel.style.willChange = 'transform';
            this.previewPanel.style.willChange = 'transform';
        }

        bindEvents() {
            // 使用passive: true提升滚动性能
            divider.addEventListener('mousedown', this.handleMouseDown.bind(this), { passive: true });
            divider.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        }

        handleMouseDown(e) {
            this.startDrag(e.clientX);
        }

        handleTouchStart(e) {
            const touch = e.touches[0];
            this.startDrag(touch.clientX);
            e.preventDefault();
        }

        startDrag(clientX) {
            this.isDragging = true;
            this.startX = clientX;
            this.startWidth = this.editorPanel.offsetWidth;

            // 优化拖拽状态的视觉反馈
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            divider.classList.add('dragging');

            // 绑定优化后的事件监听器
            document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
            document.addEventListener('mouseup', this.handleMouseUp.bind(this), { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        }

        handleMouseMove(e) {
            this.updateDrag(e.clientX);
        }

        handleTouchMove(e) {
            const touch = e.touches[0];
            this.updateDrag(touch.clientX);
            e.preventDefault();
        }

        updateDrag(clientX) {
            if (!this.isDragging) return;

            const currentTime = performance.now();
            if (currentTime - this.lastFrameTime < this.frameInterval) {
                return; // 跳过过频繁的更新
            }
            this.lastFrameTime = currentTime;

            // 使用requestAnimationFrame确保流畅的动画
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }

            this.animationId = requestAnimationFrame(() => {
                this.performLayoutUpdate(clientX);
            });
        }

        performLayoutUpdate(clientX) {
            const deltaX = clientX - this.startX;
            const minPanelWidth = 200;
            const maxPanelWidth = this.cachedWidth - minPanelWidth;
            const newWidth = Math.max(minPanelWidth, Math.min(maxPanelWidth, this.startWidth + deltaX));

            // 计算百分比并应用更新
            const editorPercent = (newWidth / this.cachedWidth) * 100;
            const previewPercent = 100 - editorPercent;

            // 使用transform优化性能，避免重排
            this.updatePanelSizes(editorPercent, previewPercent);

            // 更新缓存
            this.cachedWidth = this.mainContent.offsetWidth;
        }

        updatePanelSizes(editorPercent, previewPercent) {
            // 使用CSS变量而不是直接修改flex属性
            this.editorPanel.style.setProperty('--editor-percent', `${editorPercent}%`);
            this.previewPanel.style.setProperty('--preview-percent', `${previewPercent}%`);

            // 更新flex属性
            this.editorPanel.style.flex = `0 0 ${editorPercent}%`;
            this.previewPanel.style.flex = `0 0 ${previewPercent}%`;
        }

        handleMouseUp() {
            this.endDrag();
        }

        handleTouchEnd() {
            this.endDrag();
        }

        endDrag() {
            if (!this.isDragging) return;

            this.isDragging = false;

            // 清理状态
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            divider.classList.remove('dragging');

            // 取消动画帧
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            // 移除事件监听器
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
            document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
            document.removeEventListener('touchend', this.handleTouchEnd.bind(this));

            // 触发布局重计算以确保最终状态正确
            this.forceLayoutUpdate();
        }

        forceLayoutUpdate() {
            // 强制浏览器重新计算布局
            this.mainContent.offsetHeight;
        }

        destroy() {
            // 清理资源
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }

            // 移除所有事件监听器
            divider.removeEventListener('mousedown', this.handleMouseDown.bind(this));
            divider.removeEventListener('touchstart', this.handleTouchStart.bind(this));
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
            document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
            document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        }
    }

    // 创建拖拽优化器实例
    const dragOptimizer = new DividerDragOptimizer();

    // 键盘快捷键支持 - 使用左右箭头调整面板大小
    function handlePanelResizeKeyboard(e) {
        if (!e.ctrlKey && !e.metaKey) return;

        const step = e.shiftKey ? 50 : 10; // Shift键增加步长
        let delta = 0;

        switch(e.key) {
            case 'ArrowLeft':
                delta = -step;
                break;
            case 'ArrowRight':
                delta = step;
                break;
            default:
                return;
        }

        e.preventDefault();

        // 获取当前面板宽度
        const currentWidth = dragOptimizer.editorPanel.offsetWidth;
        const newWidth = Math.max(200, Math.min(window.innerWidth - 200, currentWidth + delta));

        // 应用更新
        const editorPercent = (newWidth / dragOptimizer.cachedWidth) * 100;
        const previewPercent = 100 - editorPercent;
        dragOptimizer.updatePanelSizes(editorPercent, previewPercent);

        showNotification(`面板宽度已调整到 ${Math.round(editorPercent)}%`, 'info');
    }

    document.addEventListener('keydown', handlePanelResizeKeyboard);

    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        dragOptimizer.destroy();
    });

    // === 快捷键支持 ===
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveBtn.click();
        }

        // Ctrl/Cmd + O: 打开文件
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            importBtn.click();
        }

        // Ctrl/Cmd + E: 导出 Markdown
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportBtn.click();
        }

        // Ctrl/Cmd + Shift + E: 导出 HTML
        if ((e.ctrlKey || e.metaKey) && e.key === 'E') {
            e.preventDefault();
            exportHtmlBtn.click();
        }

        // Ctrl/Cmd + D: 切换主题
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            themeToggle.click();
        }

        // Ctrl/Cmd + /: 显示/隐藏编辑器
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleEditorBtn.click();
        }

        // Ctrl/Cmd + .: 显示/隐藏预览
        if ((e.ctrlKey || e.metaKey) && e.key === '.') {
            e.preventDefault();
            togglePreviewBtn.click();
        }

        // 面板大小调整快捷键 (已由handlePanelResizeKeyboard处理)
        // Ctrl/Cmd + Left/Right Arrow: 调整面板大小
        // Ctrl/Cmd + Shift + Left/Right Arrow: 快速调整面板大小
    });

    // === 工具函数 ===

    // 生成完整 HTML 页面
    function generateHtmlPage(content, title) {
        const currentTheme = document.body.className;
        const isDark = currentTheme.includes('dark');

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif;
            line-height: 1.6;
            color: ${isDark ? '#f5f5f7' : '#1d1d1f'};
            background-color: ${isDark ? '#000000' : '#ffffff'};
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        .container {
            background-color: ${isDark ? '#1c1c1e' : '#ffffff'};
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .header {
            border-bottom: 1px solid ${isDark ? '#38383a' : '#d2d2d7'};
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: ${isDark ? '#f5f5f7' : '#1d1d1f'};
        }

        .header .meta {
            color: ${isDark ? '#86868b' : '#86868b'};
            font-size: 0.9rem;
        }

        .content {
            line-height: 1.8;
        }

        .content h1,
        .content h2,
        .content h3,
        .content h4,
        .content h5,
        .content h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }

        .content h1 { font-size: 2rem; }
        .content h2 { font-size: 1.5rem; }
        .content h3 { font-size: 1.25rem; }
        .content h4 { font-size: 1rem; }

        .content p {
            margin-bottom: 1rem;
        }

        .content ul,
        .content ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
        }

        .content li {
            margin-bottom: 0.5rem;
        }

        .content blockquote {
            border-left: 4px solid #0071e3;
            margin: 1rem 0;
            padding: 1rem;
            background-color: ${isDark ? 'rgba(0, 113, 227, 0.1)' : 'rgba(0, 113, 227, 0.05)'};
            border-radius: 0 8px 8px 0;
        }

        .content code {
            background-color: ${isDark ? '#38383a' : '#f5f5f7'};
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace;
            font-size: 0.9rem;
        }

        .content pre {
            background-color: ${isDark ? '#38383a' : '#f5f5f7'};
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            border: 1px solid ${isDark ? '#48484a' : '#e5e5e7'};
        }

        .content pre code {
            background: none;
            padding: 0;
            border: none;
        }

        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .content th,
        .content td {
            border: 1px solid ${isDark ? '#38383a' : '#d2d2d7'};
            padding: 0.75rem;
            text-align: left;
        }

        .content th {
            background-color: ${isDark ? '#2c2c2e' : '#f9f9f9'};
            font-weight: 600;
        }

        .content a {
            color: #0071e3;
            text-decoration: none;
        }

        .content a:hover {
            text-decoration: underline;
        }

        .content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1rem 0;
        }

        .content hr {
            border: none;
            border-top: 1px solid ${isDark ? '#38383a' : '#d2d2d7'};
            margin: 2rem 0;
        }

        .footer {
            text-align: center;
            color: ${isDark ? '#86868b' : '#86868b'};
            font-size: 0.8rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid ${isDark ? '#38383a' : '#d2d2d7'};
        }

        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }

            .container {
                padding: 1.5rem;
            }

            .header h1 {
                font-size: 1.5rem;
            }
        }

        @media print {
            body {
                background: white;
                color: black;
                max-width: none;
                margin: 0;
                padding: 0;
            }

            .container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <div class="meta">
                由 Markdown Editor 生成 |
                生成时间: ${new Date().toLocaleString('zh-CN')}
            </div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>此文档由 <strong>Markdown Editor</strong> 生成</p>
            <p>一个现代化的实时 Markdown 编辑器</p>
        </div>
    </div>
</body>
</html>`;
    }

    // 获取 SVG 图标
    function getIconSVG(type) {
        const icons = {
            save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
            import: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
            export: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
            edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 9 21 9"/></svg>',
            preview: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="17" x2="13" y2="17"/></svg>',
            help: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            theme: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
            refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
            clear: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
        };

        return icons[type] || '';
    }

    // 获取 Markdown 指南内容
    function getMarkdownGuide() {
        return `# Markdown 语法指南

这是一个 Markdown 格式的快速参考指南，您可以随时查看这个页面来学习 Markdown 的使用方法。

## 基本语法

### 标题

使用 \`#\` 符号创建标题，数量表示标题级别：

\`\`\`
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
\`\`\`

### 强调文本

\`\`\`
*斜体文本* 或 _斜体文本_
**粗体文本** 或 __粗体文本__
***粗斜体文本*** 或 ___粗斜体文本___
~~删除线文本~~
\`\`\`

### 列表

**无序列表：**
\`\`\`
- 项目1
- 项目2
  - 子项目A
  - 子项目B
    - 嵌套项目
\`\`\`

**有序列表：**
\`\`\`
1. 第一项
2. 第二项
3. 第三项
   1. 子项目1
   2. 子项目2
\`\`\`

**任务列表：**
\`\`\`
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 待办事项
\`\`\`

### 链接

\`\`\`
[链接文本](https://www.example.com)
[带标题的链接](https://www.example.com "链接标题")
\`\`\`

### 图片

\`\`\`
![替代文本](图片URL)
![带标题的图片](图片URL "图片标题")
\`\`\`

## 高级语法

### 表格

\`\`\`
| 表头1 | 表头2 | 表头3 |
| :--- | :---: | ---: |
| 左对齐 | 居中对齐 | 右对齐 |
| 单元格4 | 单元格5 | 单元格6 |
\`\`\`

### 代码

**行内代码：** 使用反引号包围 \`代码\`

**代码块：**
\`\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet('World');
\`\`\`\`

### 引用

\`\`\`
> 这是一段引用文本
>
> 这是引用的第二段
>
> > 嵌套引用
\`\`\`

### 分隔线

使用三个或更多的符号创建分隔线：

\`\`\`
***
---
___
\`\`\`

### 脚注

\`\`\`
这是一个带有脚注的文本[^1]

[^1]: 这是脚注的内容
\`\`\`

## 特殊功能

### 自动链接

\`\`\`
https://www.example.com
email@example.com
\`\`\`

### 转义字符

使用反斜杠转义特殊字符：

\`\`\`
\\* 不是斜体文本 \\*
\\# 不是标题 \\#
\`\`\`

## 使用技巧

1. **实时预览：** 在左侧编辑器输入 Markdown 语法，右侧会立即显示效果
2. **自动保存：** 您的内容会自动保存到浏览器本地存储中
3. **快捷键：** 使用 Ctrl+S 保存，Ctrl+O 打开文件，Ctrl+E 导出
4. **主题切换：** 点击右上角的主题按钮可以切换不同的界面主题
5. **拖拽调整：** 拖拽中间的分割线可以调整编辑器和预览区的宽度
6. **键盘调整：** 使用 Ctrl/Cmd + 左右箭头键精确调整面板大小
7. **触摸支持：** 支持触摸设备的分割线拖拽操作

## 常见问题

**Q: 如何插入图片？**
A: 使用 \`![图片描述](图片URL)\` 语法，支持网络图片链接

**Q: 如何创建链接？**
A: 使用 \`[链接文本](URL)\` 语法

**Q: 如何添加代码高亮？**
A: 在代码块开始处指定语言，如 \`\`\`javascript

**Q: 如何制作表格？**
A: 使用 \`|\` 分隔单元格，第二行用 \`-\` 和 \`:\` 控制对齐方式

---

> 💡 **提示：** 现在您可以点击工具栏上的"返回编辑"按钮回到您之前的编辑内容。

祝您使用愉快！`;
    }

    // === 初始化应用 ===

    // 加载保存的内容
    function initializeContent() {
        const savedContent = localStorage.getItem('markdown-content');
        if (savedContent) {
            editor.value = savedContent;
        } else {
            // 显示欢迎内容
            editor.value = `# 欢迎使用 Markdown Editor

这是一个现代化的 Markdown 编辑器，具有以下特性：

## ✨ 主要功能

- 🎨 **多主题支持** - 浅色、深色、蓝色、赛博朋克主题
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 💾 **自动保存** - 内容自动保存到本地存储
- 🔄 **实时预览** - 输入即时显示效果
- 📊 **统计信息** - 实时显示字数、行数、光标位置
- ⌨️ **快捷键支持** - 提高编辑效率
- 📤 **多格式导出** - 支持 Markdown 和 PDF 导出
- 🎯 **行号显示** - 便于定位和调试

## 🚀 快速开始

1. 在左侧编辑器输入 Markdown 语法
2. 右侧实时预览效果
3. 使用工具栏按钮进行各种操作
4. 内容会自动保存，无需担心丢失

## 🎯 快捷键

- \`Ctrl/Cmd + S\` - 保存
- \`Ctrl/Cmd + O\` - 打开文件
- \`Ctrl/Cmd + E\` - 导出
- \`Ctrl/Cmd + D\` - 切换主题
- \`Ctrl/Cmd + /\` - 显示/隐藏编辑器
- \`Ctrl/Cmd + .\` - 显示/隐藏预览
- \`Ctrl/Cmd + ←/→\` - 调整面板大小
- \`Ctrl/Cmd + Shift + ←/→\` - 快速调整面板大小

## 💡 提示

点击工具栏的问号按钮可以查看完整的 Markdown 语法指南。

开始您的 Markdown 创作之旅吧！ 🎉`;
        }

        renderMarkdown(false);
    }

    // 启动应用
    function initializeApp() {
        initializeTheme();
        initializeContent();

        // 初始化设置
        if (typeof initializeSettings === 'function') {
            initializeSettings();
        }

        // 添加淡入动画
        document.querySelector('.app-container').classList.add('fade-in');

        // 显示欢迎消息
        setTimeout(() => {
            showNotification('欢迎使用 Markdown Editor！', 'success');
        }, 500);
    }

    // 错误处理
    window.addEventListener('error', (e) => {
        console.error('应用错误:', e.error);
        showNotification('应用出现错误，请刷新页面重试', 'error');
    });

    // 启动应用
    initializeApp();
});

// 添加全局样式
const additionalStyles = `
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; transform: translateY(-10px); }
}

.notification {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading {
    border: 2px solid var(--border-color);
    border-top-color: var(--accent-color);
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

// === 设置面板功能 ===

// 获取设置面板相关的DOM元素
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const settingsSaveBtn = document.getElementById('settingsSaveBtn');
const settingsResetBtn = document.getElementById('settingsResetBtn');

// 字体设置元素
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamilySelect = document.getElementById('fontFamilySelect');

// 背景图片设置元素
const bgImageInput = document.getElementById('bgImageInput');
const bgImageBtn = document.getElementById('bgImageBtn');
const bgImageRemoveBtn = document.getElementById('bgImageRemoveBtn');
const bgOpacitySlider = document.getElementById('bgOpacitySlider');
const bgOpacityValue = document.getElementById('bgOpacityValue');
const bgModeRadios = document.querySelectorAll('input[name="bgMode"]');

// 背景图片元素
const bgContainer = document.getElementById('bgContainer');
const bgImage = document.getElementById('bgImage');

// 设置状态
let settings = {
    fontSize: 16,
    fontFamily: "'JetBrains Mono', monospace",
    backgroundImage: null,
    backgroundOpacity: 30,
    backgroundMode: 'stretch'
};

// 初始化设置
function initializeSettings() {
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem('markdown-settings');
    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
            applySettings();
        } catch (error) {
            console.error('加载设置失败:', error);
            loadDefaultSettings();
        }
    } else {
        loadDefaultSettings();
    }
}

// 加载默认设置
function loadDefaultSettings() {
    settings = {
        fontSize: 16,
        fontFamily: "'JetBrains Mono', monospace",
        backgroundImage: null,
        backgroundOpacity: 30,
        backgroundMode: 'stretch'
    };
    applySettings();
}

// 应用设置到UI
function applySettings() {
    // 应用字体设置
    fontSizeSlider.value = settings.fontSize;
    fontSizeValue.textContent = `${settings.fontSize}px`;
    fontFamilySelect.value = settings.fontFamily;
    document.documentElement.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--font-mono', settings.fontFamily);

    // 应用背景图片设置
    bgOpacitySlider.value = settings.backgroundOpacity;
    bgOpacityValue.textContent = `${settings.backgroundOpacity}%`;

    // 设置背景图片显示模式
    bgModeRadios.forEach(radio => {
        radio.checked = radio.value === settings.backgroundMode;
    });

    // 应用背景图片
    if (settings.backgroundImage) {
        bgImage.src = settings.backgroundImage;
        bgImage.style.display = 'block';
        bgImage.style.opacity = settings.backgroundOpacity / 100;
        bgImage.className = `app-bg-image ${settings.backgroundMode}`;
    } else {
        bgImage.style.display = 'none';
    }
}

// 保存设置到localStorage
function saveSettings() {
    try {
        localStorage.setItem('markdown-settings', JSON.stringify(settings));
        showNotification('设置已保存', 'success');
    } catch (error) {
        console.error('保存设置失败:', error);
        showNotification('保存设置失败', 'error');
    }
}

// 重置设置
function resetSettings() {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
        loadDefaultSettings();
        saveSettings();
        showNotification('设置已重置', 'success');
    }
}

// 显示设置面板
function showSettingsModal() {
    settingsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 隐藏设置面板
function hideSettingsModal() {
    settingsModal.classList.remove('show');
    document.body.style.overflow = '';
}

// 处理背景图片上传
function handleBackgroundImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showNotification('请选择有效的图片文件', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB限制
        showNotification('图片文件不能超过5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        settings.backgroundImage = e.target.result;
        bgImage.src = e.target.result;
        bgImage.style.display = 'block';
        bgImage.style.opacity = settings.backgroundOpacity / 100;
        bgImage.className = `app-bg-image ${settings.backgroundMode}`;
        showNotification('背景图片已设置', 'success');
    };
    reader.onerror = function() {
        showNotification('图片读取失败', 'error');
    };
    reader.readAsDataURL(file);
}

// 移除背景图片
function removeBackgroundImage() {
    settings.backgroundImage = null;
    bgImage.style.display = 'none';
    showNotification('背景图片已移除', 'success');
}

// 事件监听器
settingsBtn.addEventListener('click', showSettingsModal);
settingsCloseBtn.addEventListener('click', hideSettingsModal);
settingsSaveBtn.addEventListener('click', () => {
    saveSettings();
    hideSettingsModal();
});
settingsResetBtn.addEventListener('click', resetSettings);

// 点击模态框外部关闭
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        hideSettingsModal();
    }
});

// 字体大小滑块
fontSizeSlider.addEventListener('input', (e) => {
    const fontSize = parseInt(e.target.value);
    settings.fontSize = fontSize;
    fontSizeValue.textContent = `${fontSize}px`;
    document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
});

// 字体选择
fontFamilySelect.addEventListener('change', (e) => {
    settings.fontFamily = e.target.value;
    document.documentElement.style.setProperty('--font-mono', settings.fontFamily);
});

// 背景图片选择
bgImageBtn.addEventListener('click', () => {
    bgImageInput.click();
});

bgImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleBackgroundImageUpload(file);
    }
});

// 移除背景图片
bgImageRemoveBtn.addEventListener('click', removeBackgroundImage);

// 背景透明度滑块
bgOpacitySlider.addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value);
    settings.backgroundOpacity = opacity;
    bgOpacityValue.textContent = `${opacity}%`;
    if (settings.backgroundImage) {
        bgImage.style.opacity = opacity / 100;
    }
});

// 背景显示模式
bgModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        settings.backgroundMode = e.target.value;
        if (settings.backgroundImage) {
            bgImage.className = `app-bg-image ${settings.backgroundMode}`;
        }
    });
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // ESC键关闭设置面板
    if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
        hideSettingsModal();
    }

    // Ctrl/Cmd + , 打开设置面板
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        showSettingsModal();
    }
});

