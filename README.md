# 语音合成工坊 🎙️

基于 [MiniMax T2A v2](https://platform.minimaxi.com/) 的本地批量语音合成工具。

支持三种输入模式（单词/句子/段落）、多音色槽批量生成、File System Access API 直存本地、ZIP 打包兜底。

## 特性

- **三种输入模式**：单词（一行一个）、句子（一行一句）、段落（空行分隔）
- **多音色槽**：1~N 个音色同时跑，每个词自动生成多份
- **20+ 语言 / 150+ 系统音色**：中、英、日、韩、西、法、阿拉伯等
- **本地直存**：通过 File System Access API 直接写入磁盘文件夹
- **ZIP 兜底**：浏览器不支持目录选择时打包下载
- **智能去重**：生成前检测目标目录已有文件，跳过重复
- **失败重试**：遇限流自动等待 10s，连续 5 次失败自动停止
- **自定义音色**：把喜欢的音色 ID 保存到本地，跨语言复用
- **键盘快捷键**：`⌘/Ctrl + Enter` 开始生成，`Esc` 中断
- **现代 UI**：卡片化布局，6 色渐变主题，原生 React 18 + TS 5

## 快速开始

```bash
# 1. 安装依赖（首次）
npm install

# 2. 一键构建并启动（macOS / Linux）
./start.sh

# 3. 浏览器打开
# http://localhost:8888
```

> `start.sh` 会自动跑 `npm run build` 然后用 Python 启动静态服务器（8888 端口），访问时只服务 `dist/` 目录。

### 手动模式

```bash
# 开发模式（热更新，HMR）
npm run dev
# → http://localhost:8888

# 生产构建
npm run build        # 产物在 dist/

# 代码检查 / 格式化
npm run lint
npm run format
```

## 使用流程

1. 进入 **音色管理** → 输入 MiniMax API Key → 保存
2. 选择语言 → 点击 **🔄 从 API 刷新** 拉取最新音色库
3. （可选）保存自定义音色 ID
4. 返回 **合成主页**
5. 选择语言 + 模型 → 配置音色槽（选哪些音色）
6. 调速度 / 音量 / 音高 / 采样率 / 并发数
7. 切换输入模式（单词 / 句子 / 段落）→ 粘贴文本 → **📥 导入**
8. 点击 **📂 选目录** 授权本地写入目录
9. **▶️ 批量生成** — 进度条 + 实时日志滚动

> 目录选择是**硬性要求**：未选目录时点生成会弹出提示并自动打开目录选择器。

## 文件命名规则

| 模式 | 格式 | 示例 |
|------|------|------|
| 单词 | `{word}-{voice}.mp3` | `hello-GracefulLady.mp3` |
| 句子 | `s_{首词}_{HHMMSS}-{voice}.mp3` | `s_今天_093318-A.mp3` |
| 段落 | `p_{首词}_{HHMMSS}-{voice}.mp3` | `p_今天_093318-A.mp3` |

> 同一文本 + 同一音色会先扫一遍目标目录跳过已存在文件（开启"跳过重复"时）。

## 浏览器要求

| 浏览器 | 状态 |
|--------|------|
| Chrome / Edge（≥86） | ✅ 推荐：完整支持 File System Access API |
| Safari / Firefox | ⚠️ 兼容：自动降级到 ZIP 打包下载 |

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 18 + TypeScript 5（strict） |
| 构建 | Vite 5 |
| 路由 | React Router v6 — HashRouter（兼容 `python -m http.server`） |
| 状态 | Zustand 4 + persist（`localStorage`） |
| 样式 | CSS Modules + 全局 Token（`src/styles/tokens.css`） |
| 图标 | lucide-react |
| ZIP | fflate |
| 持久化 | `localStorage`（与旧版 HTML 共用同一套 `tts_*` key） |

### 为什么用 HashRouter

`start.sh` 用 `python -m http.server` 起服务，不支持 SPA fallback。`HashRouter` 把路由放在 `#/` 之后，刷新/直链都不会 404。

### 旧版兼容

所有写操作都镜像到原版 `tts_*` 键名，旧版 HTML 仍能读，迁移零摩擦。启动时会自动读取并迁移历史数据。

## 项目结构

```
自动合成语音/
├── index.html                     # Vite 入口（含 SVG favicon）
├── start.sh                       # 一键构建 + 启动静态服务器
├── package.json
├── vite.config.ts                 # base:'./'，port:8888，alias @ → src
├── tsconfig.app.json              # strict + noUncheckedIndexedAccess
├── src/
│   ├── main.tsx                   # React 根 + 全局错误监听
│   ├── App.tsx                    # HashRouter + Header + ToastHost
│   ├── styles/
│   │   ├── tokens.css             # 颜色/圆角/阴影/渐变/图标调色板
│   │   ├── reset.css
│   │   ├── utilities.css
│   │   └── index.css
│   ├── types/                     # voice / entry / settings / log
│   ├── lib/                       # api / fs-api / zip / text / classify / voices-db / voice-meta
│   ├── store/                     # 5 个 Zustand store
│   ├── hooks/useKeyboardShortcut.ts
│   ├── components/                # 通用组件（GroupCard / Button / Header / ...）
│   ├── routes/                    # 三个路由壳
│   └── features/
│       ├── synthesis/             # 合成主页
│       │   ├── SynthesisPage.{tsx,module.css}
│       │   ├── components/        # 7 个：ModelLanguage / VoiceSlot / Params / InputArea / SaveDirBar / WordTable / BottomBar
│       │   └── hooks/             # useImport / useGeneration / useFsApi
│       └── voices/                # 音色管理
│           ├── VoicesPage.{tsx,module.css}
│           ├── components/        # 4 个：ApiKeyCard / VoiceGrid / CustomVoiceForm / CustomVoiceList
│           └── hooks/             # useApiKey / useVoiceRefresh
└── dist/                          # 构建产物
```

## 配置说明

### 环境变量

无。所有配置（API Key、模型、参数、音色）都在浏览器端 `localStorage`。

### 端口

默认 8888，修改 `vite.config.ts` 的 `server.port` + `start.sh` 的 `python3 -m http.server` 端口即可。

### 关键 localStorage 键

| Key | 用途 |
|-----|------|
| `minimax_api_key` | API 鉴权 |
| `tts_language` | 当前语言 |
| `tts_modelSelect` | 当前模型 |
| `tts_speed` / `tts_vol` / `tts_pitch` | 语音参数 |
| `tts_concurrency` | 并发数（1-20） |
| `tts_audioFormat` / `tts_sampleRate` | 音频格式 |
| `tts_voice_cache` / `tts_voice_cache_time` | 音色库缓存（24h 过期） |
| `tts_voice_slots_<lang>` | 每语言音色槽位 |
| `tts_voice_slots` | 跨语言音色槽位（默认） |
| `tts_custom_voices` | 用户自定义音色 |
| `tts_save_dir_name` | 保存目录名（仅显示，不含权限） |

## API 参考

### 音色列表

```
POST https://api.minimaxi.com/v1/get_voice
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "voice_type": "system"
}
```

返回 `data.system_voice[]`，每项含 `voice_id` / `voice_name` / `description[]` / `created_time`。

### 语音合成

```
POST https://api.minimaxi.com/v1/t2a_v2
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "speech-2.8-hd",
  "text": "你好",
  "stream": false,
  "voice_setting": {
    "voice_id": "male-qn-qingse",
    "speed": 1.0,
    "vol": 1.0,
    "pitch": 0
  },
  "audio_setting": {
    "sample_rate": 32000,
    "bitrate": 128000,
    "format": "mp3",
    "channel": 1
  },
  "output_format": "hex",
  "language_boost": "Chinese"
}
```

返回 `data.audio`（hex 编码）+ `data.audio_size`。

## 开发

### 目录约定

- **Feature-based**：业务代码全部在 `src/features/<name>/` 下
- **跨 feature 复用**才放 `src/components/`
- **types / lib / store** 全局共享
- CSS Modules + BEM 风格类名，遵循所在文件惯例

### 代码风格

- ESLint + Prettier（`npm run lint` / `npm run format`）
- TS strict 模式，禁用隐式 any
- 不写注释（除非必要）
- 提交前跑一遍 `npm run build` 确保无类型错误

### 调试

- `main.tsx` 挂了全局 `window.onerror` / `unhandledrejection`，会在 console 打印完整堆栈
- `useVoiceRefresh` 在 API 失败时会 `console.error` 完整响应（status + body）
- F12 → Console 即可看全部运行日志

## License

MIT
