# ---- 第 1 阶段：安装依赖并构建 ----
FROM node:22-alpine AS builder

# 安装构建工具和 pnpm
RUN apk add --no-cache python3 make g++ \
    && npm config set registry https://registry.npmmirror.com \
    && npm install -g pnpm@10.14.0

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

# ---- 第 2 阶段：生成运行时镜像 ----
FROM node:22-alpine AS runner

# 安装 CA 证书以支持 HTTPS 请求
RUN apk add --no-cache ca-certificates \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app

# 创建视频缓存目录和数据目录并设置权限
RUN mkdir -p /app/video-cache /app/data && chown -R nextjs:nodejs /app/video-cache /app/data
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_BUILD=true

# 从构建器中复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# 从构建器中复制 start.js
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非特权用户
USER nextjs

EXPOSE 3000

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "start.js"]
