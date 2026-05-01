# 🚀 Blog - Next.js 16 with Docker Deployment

> pnpm workspace 기반 monorepo 블로그 프로젝트

## 📁 프로젝트 구조

```
blog/
├── Dockerfile              # Docker 멀티 스테이지 빌드
├── docker-compose.yml      # Next.js + Nginx 구성
├── .dockerignore          # Docker 빌드 최적화
├── pnpm-workspace.yaml    # pnpm workspace 설정
├── pnpm-lock.yaml         # 의존성 잠금 파일
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions CI/CD
│
└── apps/
    └── blog/              # Next.js 16 블로그
        ├── src/
        ├── content/       # MDX 포스트
        ├── nginx/         # Nginx 설정
        ├── scripts/       # 배포 스크립트
        └── ...
```

## 🎯 주요 특징

### Next.js 16 App Router

- App Router 기반 최신 Next.js
- Standalone 출력 모드로 Docker 최적화
- MDX 기반 블로그 포스트
- 다크 모드 지원

### Docker & Nginx

- **멀티 스테이지 빌드**: 최종 이미지 ~150MB
- **Nginx 리버스 프록시**: 보안 및 성능 최적화
- **SSL/TLS**: Let's Encrypt 자동 인증서
- **헬스체크**: 자동 컨테이너 모니터링

### Monorepo 구조

- pnpm workspace 활용
- 효율적인 의존성 관리
- 확장 가능한 구조

## 🚀 빠른 시작

### 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
cd apps/blog
pnpm dev

# http://localhost:3000
```

### Docker 로컬 테스트

```bash
# 루트 디렉토리에서 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# http://localhost
```

## 📦 배포

### AWS EC2 배포

상세한 배포 가이드는 다음 문서를 참고하세요:

- **[DEPLOYMENT.md](./apps/blog/DEPLOYMENT.md)** - 전체 배포 프로세스
- **[DOCKER_DEPLOYMENT.md](./apps/blog/DOCKER_DEPLOYMENT.md)** - Docker 빠른 시작
- **[MONOREPO_NOTE.md](./apps/blog/MONOREPO_NOTE.md)** - Monorepo 구조 설명

### 빠른 배포

```bash
# 1. EC2 SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. 초기 설정 (최초 1회)
sudo bash apps/blog/scripts/setup-ec2.sh

# 3. SSL 인증서 설정
sudo bash apps/blog/scripts/ssl-setup.sh

# 4. 배포 (루트에서 실행)
cd ~/blog
docker-compose up -d --build
```

## 🔧 유용한 명령어

### 로컬 개발

```bash
# 개발 서버
cd apps/blog && pnpm dev

# 빌드 테스트
cd apps/blog && pnpm build

# 린트
cd apps/blog && pnpm lint
```

### Docker 관리

```bash
# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 컨테이너 재시작
docker-compose restart

# 컨테이너 중지
docker-compose down

# 전체 재빌드
docker-compose build --no-cache
docker-compose up -d
```

### 배포 스크립트

```bash
# 자동 배포
bash apps/blog/scripts/deploy.sh

```

## 📚 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Content**: MDX
- **Package Manager**: pnpm
- **Containerization**: Docker
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions

## 🔐 환경 변수

로컬 개발은 `apps/blog/.env.example`을 `apps/blog/.env.local`로 복사해
사용합니다. Docker 배포는 프로젝트 루트의 `.env.example`을 `.env`로
복사한 뒤 실제 값을 채웁니다. 실제 secret 값은 커밋하지 않습니다.

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://byeoung.dev
GITHUB_CONTENT_OWNER=
GITHUB_CONTENT_REPO=
GITHUB_CONTENT_BRANCH=main
GITHUB_CONTENT_TOKEN=
GITHUB_WEBHOOK_SECRET=
```

GitHub 콘텐츠 저장소 변수는 서버 런타임에서만 사용합니다.
`GITHUB_CONTENT_TOKEN`은 콘텐츠 저장소를 읽을 수 있는 최소 권한 토큰이고,
`GITHUB_WEBHOOK_SECRET`은 GitHub webhook의 secret 값과 같아야 합니다.
Docker 배포에서는 `docker-compose.yml`의 `nextjs` 서비스가 루트 `.env`
파일 값을 컨테이너 런타임 환경 변수로 주입합니다.

## 📝 문서

- [DEPLOYMENT.md](./apps/blog/DEPLOYMENT.md) - AWS EC2 배포 가이드
- [DOCKER_DEPLOYMENT.md](./apps/blog/DOCKER_DEPLOYMENT.md) - Docker 빠른 시작
- [MONOREPO_NOTE.md](./apps/blog/MONOREPO_NOTE.md) - Monorepo 구조 설명
- [README_DOCKER.md](./apps/blog/README_DOCKER.md) - Docker 배포 요약

## ⚠️ 중요: Monorepo 구조

이 프로젝트는 **pnpm workspace** 기반 monorepo입니다.

### Docker 파일 위치

- ✅ `Dockerfile` - **루트**에 위치
- ✅ `docker-compose.yml` - **루트**에 위치
- ✅ `.dockerignore` - **루트**에 위치

### 명령어 실행 위치

```bash
# ✅ Docker 명령어는 루트에서
cd ~/blog  # 루트
docker-compose up -d

# ✅ 개발 명령어는 apps/blog에서
cd ~/blog/apps/blog
pnpm dev
```

자세한 내용은 [MONOREPO_NOTE.md](./apps/blog/MONOREPO_NOTE.md)를 참고하세요.

## 🌐 도메인

- https://byeoung.dev
- https://www.byeoung.dev
- https://resume.byeoung.dev

## 📄 라이선스

MIT

## 👨‍💻 개발자

- **Name**: Byeong
- **Domain**: byeoung.dev
- **Repository**: https://github.com/your-username/blog
