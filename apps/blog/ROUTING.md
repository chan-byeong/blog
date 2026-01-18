# 블로그 라우팅 구조

## 라우트 구조

```
/                    → 홈페이지 (포스트 목록)
/posts/[slug]        → 개별 포스트 상세 페이지
```

## 파일 구조

```
src/
├── app/
│   ├── page.tsx                    # 홈페이지 (포스트 목록)
│   ├── posts/
│   │   └── [slug]/
│   │       ├── page.tsx            # 포스트 상세 페이지
│   │       └── not-found.tsx      # 404 페이지
│   └── layout.tsx
├── lib/
│   └── posts.ts                    # MDX 파일 읽기 및 파싱 유틸리티
└── types/
    └── post.ts                      # 포스트 타입 정의

content/
└── posts/
    └── *.mdx                        # MDX 포스트 파일들
```

## 주요 기능

### 1. 홈페이지 (`/`)

- 모든 포스트를 날짜순(최신순)으로 표시
- 각 포스트의 제목, 설명, 날짜, 태그 표시
- Stripe 스타일의 카드 레이아웃

### 2. 포스트 상세 페이지 (`/posts/[slug]`)

- 동적 라우트를 통한 개별 포스트 표시
- 정적 생성(Static Generation) 지원
- SEO를 위한 메타데이터 생성

### 3. MDX 파일 구조

```markdown
---
title: '포스트 제목'
description: '포스트 설명'
date: '2024-01-15'
tags: ['태그1', '태그2']
---

# 포스트 내용

마크다운 형식으로 작성
```

## 향후 확장 가능한 라우트

- `/tags/[tag]` - 태그별 포스트 목록
- `/about` - About 페이지
- `/archive` - 아카이브 페이지

## CMS 마이그레이션

`src/lib/posts.ts`의 함수들을 수정하여 CMS API로 교체할 수 있습니다:

- `getAllPosts()` → CMS API 호출
- `getPostBySlug()` → CMS API 호출
- 나머지 함수들도 동일하게 교체 가능
