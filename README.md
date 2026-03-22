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

## 阿里云函数计算（Serverless Devs）

根目录 **`s.yaml`** 为 FC3 资源描述（地域默认 `cn-hangzhou`，内存 512MB，超时 60s，HTTP 触发器端口 **3000**，公网临时域名需 `disableURLInternet: false`）。请先配置 `s config`，再执行 `npm run build:fc`，然后 `s deploy -y`。详情见 `s.yaml` 顶部注释。

### 从 GitHub 拉取后在云端或本机构建

仓库根目录即为项目根（与 `s.yaml`、`package.json` 同级）。典型流程：

1. `git clone` 你的仓库并 `cd` 进入目录  
2. `npm ci`（或 `npm install`）  
3. `npx prisma generate`（构建需要 Prisma Client）  
4. `npm run build:fc`（生成 standalone 并拷贝静态资源，**部署上传前必须执行**）  
5. 已安装 Serverless Devs 且完成 `s config` 后：`s deploy -y`  

**说明**：默认 SQLite 文件不会随镜像持久化；云上正式使用请改用云数据库等持久化方案。
