---
description: You are an expert in TypeScript, Node.js, Next.js 16 App Router, React 19, Tailwind CSS 4, MDX, and Shadcn UI for building a modern blog.
alwaysApply: true
---

# 블로그 프로젝트 개발 규칙

## 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: ^5
- **Styling**: Tailwind CSS ^4
- **UI Components**: Shadcn UI
- **Content**: 로컬 MDX 파일 (향후 CMS로 마이그레이션 예정)

## 컴포넌트 작성 원칙

### Server Component 우선

- **모든 컴포넌트는 기본적으로 Server Component로 작성**
- 인터랙션이 필요한 경우에만 `'use client'` 디렉티브 사용
- 클라이언트 컴포넌트는 최소한으로 유지하고, 필요한 부분만 분리

```typescript
// ✅ 좋은 예: 기본적으로 Server Component
export default function BlogPost({ slug }: { slug: string }) {
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}

// ✅ 좋은 예: 인터랙션 필요한 부분만 Client Component
('use client');
export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  // ...
}
```

## 디자인 가이드라인 (Stripe 스타일)

### 폰트

- **기본 폰트**: Inter (Google Fonts)
- 폰트 설정은 `layout.tsx`에서 관리

### 레이아웃

- **넓은 여백**: 섹션 간 충분한 여백 사용 (예: `py-16`, `py-24`)
- **최대 너비**: 콘텐츠 영역은 적절한 최대 너비로 제한 (예: `max-w-4xl mx-auto`)
- **수직 간격**: 요소 간 일관된 수직 간격 유지

### 그림자

- **부드러운 그림자**: `shadow-sm`, `shadow-md` 사용
- 강한 그림자(`shadow-lg`, `shadow-xl`)는 최소한으로 사용
- 예: `shadow-sm hover:shadow-md transition-shadow`

### 색상

- Tailwind CSS의 기본 색상 시스템 활용
- 다크 모드 지원 고려

### 예시 스타일

```typescript
// Stripe 스타일 예시
<div className='max-w-4xl mx-auto px-6 py-24'>
  <article className='bg-white dark:bg-card rounded-lg shadow-sm p-8'>
    {/* 콘텐츠 */}
  </article>
</div>
```

## UI 컴포넌트 관리

### Shadcn UI 우선

- 새로운 UI 컴포넌트가 필요하면 **먼저 shadcn/ui에 있는지 확인**
- shadcn/ui에 있는 컴포넌트는:
  1. 설치 프로세스를 안내하거나
  2. MCP를 사용해 자동으로 추가
- shadcn/ui에 없는 경우에만 커스텀 컴포넌트 작성

### 컴포넌트 위치

- 재사용 가능한 컴포넌트: `src/components/`
- 페이지별 컴포넌트: 해당 페이지 디렉토리 내

## MDX 컨텐츠 관리

### 파일 구조

- MDX 파일은 `content/` 또는 `posts/` 디렉토리에 저장
- 파일명은 slug 형식 사용 (예: `my-blog-post.mdx`)

### 메타데이터

- MDX 파일 상단에 frontmatter 포함:

```markdown
---
title: '포스트 제목'
date: '2024-01-01'
description: '포스트 설명'
tags: ['tag1', 'tag2']
---
```

### 향후 CMS 마이그레이션 고려

- MDX 파싱 로직을 추상화하여 나중에 CMS API로 쉽게 교체 가능하도록 설계
- 컨텐츠 타입 정의를 명확히 하여 타입 안정성 유지

## 코드 스타일

### TypeScript

- 엄격한 타입 체크 사용
- `any` 타입 사용 지양
- 인터페이스와 타입 별칭 적절히 활용

### 파일 명명

- 컴포넌트: PascalCase (예: `BlogPost.tsx`)
- 유틸리티: camelCase (예: `formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (예: `API_ENDPOINTS.ts`)

### Import 순서

1. React/Next.js 관련
2. 외부 라이브러리
3. 내부 컴포넌트
4. 유틸리티 함수
5. 타입 정의
6. 스타일 파일

## 성능 최적화

### 이미지

- Next.js `Image` 컴포넌트 사용
- 적절한 크기와 포맷 최적화

### 데이터 페칭

- Server Component에서 직접 데이터 페칭
- 필요한 경우 `fetch` 캐싱 전략 활용

### 번들 크기

- 클라이언트 컴포넌트 최소화
- 동적 import 필요시 사용

## 에러 처리

- 에러 바운더리 적절히 사용
- 사용자 친화적인 에러 메시지 제공
- 개발 환경에서는 상세한 에러 정보 표시
