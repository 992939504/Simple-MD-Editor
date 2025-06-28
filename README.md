# Simple MD Editor | 简洁 Markdown 编辑器

[![MIT License](https://img.shields.io/github/license/992939504/Simple-MD-Editor)](https://github.com/992939504/Simple-MD-Editor/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/github/deployments/992939504/Simple-MD-Editor/github-pages?label=Live%20Demo&style=flat-square)](https://992939504.github.io/Simple-MD-Editor/)

一款轻量而强大的、基于浏览器的 Markdown 编辑器，使用纯 HTML、CSS 和 JavaScript 构建。它提供无缝的实时预览、多种主题以及丰富的导入/导出功能，无需任何后端即可在浏览器中直接运行。

A lightweight yet powerful browser-based Markdown editor built with pure HTML, CSS, and JavaScript. It offers a seamless real-time preview, multiple themes, and various import/export options, all running directly in your browser without any backend.

---

## 🚀 Live Demo | 在线体验

**立即访问在线版本，无需安装，即开即用：**

**[https://992939504.github.io/Simple-MD-Editor/](https://992939504.github.io/Simple-MD-Editor/)**

---

## ✨ Features | 功能亮点

-   **📄 导出为 PDF (Export to PDF)**: 一键将您精心排版的文档导出为高质量的 PDF 文件，非常适合用于制作报告、简历或进行正式的分享。
-   **✍️ 实时预览 (Real-time Preview)**: 在您输入 Markdown 文本的同时，右侧会即时渲染出对应的 HTML 效果。
-   **🎨 多主题切换 (Multiple Themes)**: 内置多种精心设计的主题，满足不同场景和心情下的写作需求。
    -   ✅ **白天模式 (Default)**
    -   ✅ **黑夜模式 (Dark)**
    -   ✅ **蓝色模式 (Blue)**
    -   ✅ **赛博朋克 (Cyberpunk)**
-   **💾 本地持久化 (Local Persistence)**: 您的写作内容会自动保存到浏览器的本地存储中，刷新页面或下次访问时不会丢失。
-   **📂 文件导入/导出 (File Import/Export)**: 支持从本地导入 Markdown 文件，也可以将您的作品保存为 `.md` 文件。
-   **↔️ 响应式布局 (Responsive Layout)**: 简洁的设计能够自适应桌面和移动设备，随时随地进行创作。
-   **👁️ 视图切换 (View Toggling)**: 可以灵活地隐藏编辑区或预览区，以便专注于写作或审阅。
-   **📘 内置指南 (Built-in Guide)**: 集成了一个方便的 Markdown 语法指南，供您随时查阅。
-   **🧩 零依赖构建 (Zero Build Dependencies)**: 整个项目基于纯原生技术，仅通过 CDN 引入外部库，无需复杂的构建过程。

---

## 🛠️ Technologies Used | 技术栈

-   **HTML5**: 负责页面的基本结构。
-   **CSS3**: 负责样式设计，使用 Flexbox 进行布局，并通过 CSS 变量（Variables）实现高效的主题切换。
-   **JavaScript (ES6+)**: 负责所有的交互逻辑、DOM 操作和功能实现。
-   **[Marked.js](https://marked.js.org/)**: 一个高性能的 Markdown 解析和编译器，用于将 Markdown 文本转换为 HTML。
-   **[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)**: 用于将 HTML 预览内容生成并导出为 PDF 文档。

---

## 📦 How to Use | 如何使用

### 方法一：在线使用 (推荐)

最简单的方式是直接在浏览器中打开 **[在线体验链接](https://992939504.github.io/Simple-MD-Editor/)**。

### 方法二：本地运行

由于这是一个纯静态项目，您可以在本地轻松运行它。

1.  克隆或下载本仓库到您的本地计算机。
    ```bash
    git clone https://github.com/992939504/Simple-MD-Editor.git
    ```
2.  进入项目目录。
    ```bash
    cd Simple-MD-Editor
    ```
3.  在您喜欢的浏览器（如 Chrome, Firefox, Edge）中直接打开 `index.html` 文件即可。

---

## 🤝 Contributing | 贡献

欢迎任何形式的贡献！如果您有关于新功能、代码优化或 Bug 修复的想法，请随时 Fork 本仓库并提交 Pull Request。

1.  **Fork** 本仓库。
2.  创建您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  将分支推送到您的 Fork 仓库 (`git push origin feature/AmazingFeature`)。
5.  创建一个 **Pull Request**。

---

## 📄 License | 许可证

该项目采用 MIT 许可证。详情请参阅 [LICENSE](https://github.com/992939504/Simple-MD-Editor/blob/main/LICENSE) 文件。
