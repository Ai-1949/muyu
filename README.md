# 禅意积功德 - 电子敲钟/木鱼 Web 应用

仓库别名：**muyu**

## 本地运行步骤

1. 确保已安装 Node.js（建议 18.x 或 20.x）
2. 解压压缩包，进入 `zen-merit` 根目录
3. 安装依赖：`npm install`
4. 初始化数据库：`npx prisma generate && npx prisma db push`
5. 启动开发服务器：`npm run dev`
6. 访问 `http://localhost:3000` 即可使用

## 离线快速预览

双击或在浏览器中打开根目录下的 **`quick-preview.html`**，可在不启动 Node 的情况下体验敲击与本地统计（数据仅存于浏览器，与正式版数据库不互通）。
