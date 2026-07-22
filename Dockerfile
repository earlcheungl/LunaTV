# ---- 第 1 阶段：安装依赖并构建 ----
FROM node:22-slim AS builder

# 安装构建工具和 pnpm
RUN apt-get update && apt-get install -y python3 make g++ \
    && npm config set registry https://registry.npmmirror.com \
    && npm install -g pnpm@10.14.0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 仅复制依赖清单，提高构建缓存利用率
COPY package.json pnpm-lock.yaml ./

# 配置 pnpm 使用镜像源并安装依赖
RUN pnpm config set registry https://registry.npmmirror.com \
    && pnpm store prune \
    && pnpm install --frozen-lockfile

# 复制全部源代码
COPY . .

# 在构建阶段设置 DOCKER_BUILD，启用 standalone 输出
ENV DOCKER_BUILD=true

# 生成生产构建
RUN pnpm run build

# ---- 第 2 阶段：从 Kvrocks 镜像复制二进制文件 ----
FROM apache/kvrocks:latest AS kvrocks

# ---- 第 3 阶段：生成运行时镜像 ----
FROM debian:trixie-slim AS runner

# 安装 Node.js、CA 证书和 Kvrocks 依赖
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    libatomic1 \
    libssl3 \
    libzstd1 \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 从 Kvrocks 镜像复制二进制文件和必要的库
COPY --from=kvrocks /usr/bin/kvrocks /usr/local/bin/kvrocks

# 创建非 root 用户
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /bin/false nextjs

WORKDIR /app

# 创建数据目录并设置权限
RUN mkdir -p /app/video-cache /app/data/kvrocks && chown -R nextjs:nodejs /app/video-cache /app/data

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_BUILD=true

# Kvrocks 默认配置
ENV KVROCKS_ENABLED=true
ENV KVROCKS_PORT=6666
ENV KVROCKS_DIR=/app/data/kvrocks
ENV KVROCKS_URL=redis://localhost:6666
ENV REDIS_URL=redis://localhost:6666
ENV NEXT_PUBLIC_STORAGE_TYPE=kvrocks

# 从构建器中复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# 从构建器中复制 start.js
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制启动脚本
COPY --chown=nextjs:nodejs docker-start.sh ./docker-start.sh
RUN chmod +x ./docker-start.sh

# 切换到非特权用户（但 Kvrocks 需要 root 权限运行）
# 使用 root 运行，通过 setpriv 降权
USER root

EXPOSE 3000 6666

# 使用 Docker 启动脚本，同时启动 Kvrocks 和 Next.js
CMD ["./docker-start.sh"]
