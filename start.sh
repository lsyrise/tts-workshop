#!/bin/bash
# ============================================
# 语音合成工坊 — 一键启动脚本 (macOS)
# React + TypeScript + Vite 版本
# ============================================
set -e

PORT=8888
DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DIR/.server.pid"

echo "========================================"
echo "  🎙️  语音合成工坊 v2 (React + Vite)"
echo "========================================"

# ---------- 杀掉旧进程 ----------
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "⏹  停止旧进程 (PID: $OLD_PID)..."
    kill "$OLD_PID" 2>/dev/null
    sleep 0.5
  fi
  rm -f "$PID_FILE"
fi

# 兜底：检查端口占用
OCCUPIED=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$OCCUPIED" ]; then
  echo "⚠️  端口 $PORT 被占用，正在释放..."
  echo "$OCCUPIED" | xargs kill -9 2>/dev/null
  sleep 0.5
fi

# ---------- 检查 node_modules ----------
if [ ! -d "node_modules" ]; then
  echo "📦 首次运行，安装依赖..."
  npm install
fi

# ---------- 检查 dist ----------
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
  echo "🔨 构建生产版本..."
  npm run build
fi

# ---------- 找 Python3 ----------
PYTHON=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
 PYTHON="$cmd"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo "❌ 未找到 Python 3，无法启动静态服务器"
  exit 1
fi

# ---------- 启动 ----------
echo "🚀 启动静态服务器 (端口 $PORT, 目录 dist/)..."
cd "$DIR"
"$PYTHON" -m http.server $PORT --directory dist --bind 0.0.0.0 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

sleep 1

# 验证
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "❌ 服务器启动失败"
  rm -f "$PID_FILE"
  exit 1
fi

echo "✅ 服务器已启动 (PID: $SERVER_PID)"
echo ""
echo "   主页:     http://localhost:$PORT/"
echo "   音色管理: http://localhost:$PORT/#/voices"
echo ""
echo "💡 提示: 代码改动后运行 npm run dev 进入开发模式（热更新）"
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo ""

# ---------- 打开浏览器 ----------
open "http://localhost:$PORT/"

# 等待进程
wait $SERVER_PID 2>/dev/null
rm -f "$PID_FILE"
