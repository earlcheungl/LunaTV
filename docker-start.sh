#!/bin/bash

# Docker 启动脚本 - 同时启动 Kvrocks 和 Next.js

# 如果启用了 Kvrocks，启动 Kvrocks 服务
if [ "$KVROCKS_ENABLED" = "true" ]; then
  echo "🚀 Starting Kvrocks on port ${KVROCKS_PORT:-6666}..."

  # 创建数据目录
  mkdir -p ${KVROCKS_DIR:-/app/data/kvrocks}

  # 创建 Kvrocks 配置文件（只使用有效的配置项）
  cat > /tmp/kvrocks.conf << EOF
bind 0.0.0.0
port ${KVROCKS_PORT:-6666}
dir ${KVROCKS_DIR:-/app/data/kvrocks}
EOF

  # 使用配置文件启动 Kvrocks
  /usr/local/bin/kvrocks -c /tmp/kvrocks.conf &
  KVROCKS_PID=$!

  # 等待 Kvrocks 启动
  echo "⏳ Waiting for Kvrocks to start..."
  sleep 3

  # 检查 Kvrocks 是否在监听端口
  if netstat -tlnp 2>/dev/null | grep -q ":${KVROCKS_PORT:-6666}" || \
     ss -tlnp 2>/dev/null | grep -q ":${KVROCKS_PORT:-6666}"; then
    echo "✅ Kvrocks started successfully"
  else
    echo "⚠️ Kvrocks port check failed, but process may still be running"
  fi

  # 设置默认存储类型为 kvrocks（如果没有设置）
  if [ -z "$NEXT_PUBLIC_STORAGE_TYPE" ]; then
    export NEXT_PUBLIC_STORAGE_TYPE=kvrocks
  fi

  # 设置 Kvrocks URL（始终设置，覆盖 .env 文件）
  export KVROCKS_URL=redis://localhost:${KVROCKS_PORT:-6666}
  export REDIS_URL=redis://localhost:${KVROCKS_PORT:-6666}
fi

# 启动 Next.js 应用
echo "🚀 Starting Next.js application..."
exec node start.js
