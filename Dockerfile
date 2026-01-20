# Stage 1: 의존성 설치
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# pnpm workspace 설정 파일 복사
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc* ./
# 모든 패키지의 package.json 복사 (의존성 설치를 위해 필요)
COPY apps/blog/package.json ./apps/blog/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# Stage 2: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# deps 단계에서 설치된 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/apps/blog/node_modules ./apps/blog/node_modules

# 프로젝트 전체 소스 복사 (Next.js 추적을 위해 루트의 파일들이 필요함)
COPY . .

# Next.js 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 빌드 실행
RUN pnpm --filter blog build

# Stage 3: 실행
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone 결과물 복사
# pnpm 모노레포의 경우 .next/standalone 폴더 안에 프로젝트 전체 구조가 복제됩니다.
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/.next/static ./apps/blog/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/public ./apps/blog/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 실행 경로 주의: standalone 모드에서는 apps/blog/server.js가 실행 파일입니다.
CMD ["node", "apps/blog/server.js"]
