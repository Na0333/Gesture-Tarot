# ✨ Gesture Tarot — 手势塔罗牌

> **用手势唤醒你的五张命运牌**  
> 一款基于摄像头手势识别的创意塔罗牌互动网页应用。

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-0097A7?logo=mediapipe)

---

## 📖 项目简介

Gesture Tarot 是一款将**手势识别**与**塔罗占卜**结合的创意网页。你只需要打开浏览器、开启摄像头，便可通过手部动作与塔罗牌进行自然交互：

- 👈 **左滑／右滑** — 浏览塔罗牌
- ☝️ **竖起食指** — 暂停浏览
- ✊ **握拳** — 抽取当前牌

所有手势识别均在本地完成，**摄像头画面不会上传到任何服务器**，隐私安全有保障。

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🎴 **塔罗牌轮播** | 流畅的卡片轮播浏览，支持手势和按钮两种操作方式 |
| ✋ **实时手势识别** | 基于 MediaPipe Hands，低延迟识别手部动作 |
| 📖 **牌面解读** | 每张牌展示正位含义、关键词、爱情、事业、情感运势及建议 |
| 🔮 **五牌阵** | 抽取五张牌构成经典塔罗牌阵，每张牌对应特定位置（命运、过去、现在、未来、建议） |
| 📊 **运势分析** | 基于所抽五张牌生成综合运势解读 |
| 📝 **抽牌记录** | 记录已抽牌面、时间和牌位，支持查看历史 |
| 💾 **本地持久化** | 抽牌进度自动保存至浏览器 localStorage，刷新不丢失 |
| 🔄 **重新开始** | 一键重置牌堆和抽牌记录 |

---

## 🧰 技术栈

| 层次 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript 5.9 |
| **构建工具** | Vite 6 |
| **样式** | Tailwind CSS 3 + PostCSS |
| **动画** | Framer Motion 12 |
| **手势识别** | MediaPipe Tasks Vision（Hand Landmarker） |
| **图标** | Lucide React |
| **部署** | 静态文件托管（Nginx / 宝塔）/ EdgeOne |

---

## 📁 项目结构

```
gesture-tarot/
├── index.html                # 入口 HTML
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── tailwind.config.js        # Tailwind 配置
├── postcss.config.js         # PostCSS 配置
├── package.json
├── edgeone.config.ts         # EdgeOne 部署配置
│
├── src/
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 根组件
│   ├── index.css             # 全局样式
│   │
│   ├── components/
│   │   ├── CameraHandTracker.tsx   # 摄像头 + 手势识别核心组件
│   │   ├── TarotCarousel.tsx       # 塔罗牌轮播组件
│   │   ├── TarotSpread.tsx         # 五牌阵展示组件
│   │   ├── CardInterpretation.tsx   # 牌面解读组件
│   │   ├── FortuneResult.tsx       # 运势分析结果组件
│   │   ├── DrawRecord.tsx          # 抽牌记录组件
│   │   └── GestureGuide.tsx        # 手势操作指南组件
│   │
│   ├── data/
│   │   └── tarotCards.ts     # 塔罗牌数据（22 张大阿尔卡纳）
│   │
│   └── utils/
│       ├── fortune.ts        # 运势分析生成逻辑
│       └── gesture.ts        # 手势状态与标签映射
│
└── dist/                     # 构建输出（自动生成）
```

---

## 🚀 本地开发

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9（或使用 pnpm / yarn）

### 安装与启动

```bash
# 1. 克隆仓库
git clone https://github.com/Na0333/Gesture-Tarot.git
cd Gesture-Tarot

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 `http://127.0.0.1:5173/taluo/dist/` 即可体验。

> ⚠️ **摄像头权限提示**：本地开发时，请使用 `127.0.0.1` 而非 `localhost` 访问，或配置 HTTPS 代理，否则浏览器可能拒绝摄像头访问。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本（输出到 `dist/`） |
| `npm run preview` | 预览构建后的生产版本 |

---

## 📦 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录：

```
dist/
├── index.html
└── assets/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

---

## 🌐 部署

### 方式一：Nginx / 宝塔面板（推荐）

详见 [宝塔部署步骤.md](./宝塔部署步骤.md) 的完整指南，核心步骤：

1. 本地构建：`npm run build`
2. 将 `dist/` 目录上传至服务器网站根目录
3. **必须配置 SSL 证书（HTTPS）** —— 摄像头 API 要求安全上下文
4. 访问 `https://你的域名/taluo/dist/`

> 如要通过根域名直接访问，修改 `vite.config.ts` 中 `base: "/"` 后重新构建。

### 方式二：EdgeOne

项目内置了 [EdgeOne](https://edgeone.ai) 配置文件：

```bash
# 安装 EdgeOne CLI
npm install -g @edgeone/cli

# 部署
edgeone deploy
```

配置文件参考 [`edgeone.config.ts`](./edgeone.config.ts)。

### 方式三：任意静态托管平台

本项目为纯静态前端应用，可部署至任意静态托管服务（Vercel、Netlify、Cloudflare Pages、GitHub Pages 等）：

1. 构建：`npm run build`
2. 上传 `dist/` 目录到托管平台
3. 确保平台支持 SPA 路由或配置 `base` 路径（当前使用 `/taluo/dist/`）

---

## 🔒 隐私说明

- **摄像头画面完全在本地处理**，使用 MediaPipe Hands 进行实时手势识别
- 没有任何视频帧、截图或识别数据被上传到服务器或第三方
- 抽牌记录仅保存在浏览器 `localStorage` 中，不会同步到云端

---

## 📄 License

MIT
