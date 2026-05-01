# GitHub content repository ISR migration TODO

이 문서는 Obsidian에서 GitHub 콘텐츠 저장소로 글을 작성하고, Next.js
블로그가 GitHub API, ISR, webhook revalidation으로 새 글을 반영하도록
구현하기 위한 작업 목록입니다.

각 단계는 AI에게 독립 작업으로 맡길 수 있도록 목표, 작업 범위, 추천
프롬프트, 완료 기준을 포함합니다. 작업 전후에는 `apps/blog/`에서
`pnpm lint`와 `pnpm build`를 실행해 동작을 확인합니다.

## 1. 콘텐츠 저장소 구조 확정

GitHub 콘텐츠 저장소를 블로그 콘텐츠의 원본으로 사용합니다. 이 단계에서는
Obsidian에서 관리할 디렉터리 구조와 frontmatter 규칙을 확정합니다.

- [ ] `blog-content` 저장소를 생성한다.
- [ ] `posts/` 디렉터리를 만든다.
- [ ] `attachments/` 디렉터리를 만든다.
- [ ] 샘플 포스트 1개 이상을 `posts/*.mdx` 형식으로 추가한다.
- [ ] frontmatter 필드를 확정한다.

필수 frontmatter 필드는 다음과 같습니다.

```yaml
---
title: "Post title"
description: "Post description"
date: "2026-04-30"
updatedAt: "2026-04-30"
tags: ["nextjs", "github"]
published: true
coverImage: ""
---
```

AI 작업 프롬프트:

```txt
Obsidian에서 사용할 GitHub 콘텐츠 저장소 구조를 설계해줘.
posts/*.mdx와 attachments/* 구조를 기준으로 README.md, 샘플 MDX,
frontmatter 규칙을 만들어줘. 블로그 앱은 Next.js App Router에서
GitHub API로 이 저장소를 읽을 예정이야.
```

완료 기준:

- `posts/*.mdx` 파일이 같은 frontmatter 스키마를 사용한다.
- `published: false` 초안 정책이 문서화되어 있다.
- 이미지 경로 정책이 정해져 있다.

## 2. 환경 변수와 보안 값 추가

블로그 앱이 GitHub API와 webhook을 사용할 수 있도록 환경 변수를 추가합니다.
토큰과 webhook secret은 서버 환경에만 저장합니다.

- [x] `apps/blog/.env.example` 또는 동등한 예시 파일을 추가하거나 갱신한다.
- [x] GitHub content repo owner, repo, branch 값을 추가한다.
- [x] GitHub API token 값을 추가한다.
- [x] GitHub webhook secret 값을 추가한다.
- [x] 운영 서버의 Docker 또는 배포 환경에 같은 값을 주입한다.

권장 환경 변수는 다음과 같습니다.

```env
GITHUB_CONTENT_OWNER=
GITHUB_CONTENT_REPO=
GITHUB_CONTENT_BRANCH=main
GITHUB_CONTENT_TOKEN=
GITHUB_WEBHOOK_SECRET=
```

AI 작업 프롬프트:

```txt
이 Next.js 블로그 프로젝트에 GitHub 콘텐츠 저장소 연동용 환경 변수
예시를 추가해줘. 실제 secret은 커밋하지 말고, .env.example 또는
기존 환경 변수 문서에 GITHUB_CONTENT_OWNER, GITHUB_CONTENT_REPO,
GITHUB_CONTENT_BRANCH, GITHUB_CONTENT_TOKEN, GITHUB_WEBHOOK_SECRET의
용도를 설명해줘.
```

완료 기준:

- secret 값이 저장소에 커밋되지 않는다.
- 변수 이름이 코드 구현 계획과 일치한다.
- Docker 배포 환경에서 주입할 값이 명확하다.

## 3. GitHub 콘텐츠 클라이언트 구현

`apps/blog/src/lib/github-content.ts`를 추가해 GitHub API에서 포스트 목록과
개별 MDX 원문을 읽습니다.

- [x] GitHub repo의 `posts/` 파일 목록을 조회한다.
- [x] `posts/{slug}.mdx` 파일 내용을 조회한다.
- [x] GitHub API 응답의 base64 content를 UTF-8 문자열로 변환한다.
- [x] 목록 fetch에 `posts` cache tag를 적용한다.
- [x] 상세 fetch에 `post:{slug}` cache tag를 적용한다.
- [x] GitHub API 오류, 404, 인증 오류를 `GitHubContentError`로 처리한다.
- [x] `console.log()`를 사용하지 않는다.

추천 파일:

```txt
apps/blog/src/lib/github-content.ts
apps/blog/src/lib/post-cache-tags.ts
apps/blog/src/lib/github-content-error.ts
apps/blog/src/@types/github-content.ts
```

AI 작업 프롬프트:

```txt
apps/blog/src/lib/github-content.ts를 구현해줘.
Octokit으로 GITHUB_CONTENT_OWNER, GITHUB_CONTENT_REPO,
GITHUB_CONTENT_BRANCH의 posts 디렉터리를 읽고, getPostSlugs(),
getPostSourceBySlug(slug), getAllPostSources()를 제공해줘. Next.js fetch
cache tag는 Octokit custom fetch를 통해 목록에 posts, 상세에 post:{slug}를
붙여줘. 타입은 src/@types/github-content.ts로 분리하고, 에러 클래스는
src/lib/github-content-error.ts로 분리해줘. 로그 출력과 console.log는
사용하지 마.
```

완료 기준:

- `getPostSlugs()`가 `posts/*.mdx`에서 slug 배열을 반환한다.
- `getPostSourceBySlug(slug)`가 MDX 원문 문자열을 반환한다.
- 삭제된 글이나 없는 글은 호출자가 `notFound()` 처리할 수 있게 명확한
  반환값 또는 오류를 제공한다.

## 4. `posts.ts` 데이터 소스 전환

기존 로컬 파일 시스템 기반 포스트 로딩을 GitHub API 기반 로딩으로 바꿉니다.
UI와 페이지가 사용하는 `Post` 타입은 최대한 유지합니다.

- [x] `apps/blog/src/lib/posts.ts`에서 GitHub 콘텐츠 클라이언트를 사용한다.
- [x] 기존 `getAllPosts`, `getPostBySlug` API 형태를 유지한다.
- [x] `published: false` 포스트를 목록과 상세에서 제외한다.
- [x] 날짜 내림차순 정렬을 유지한다.
- [x] 기존 MDX 파싱 함수와 TOC 추출 함수를 재사용한다.
- [x] frontmatter 누락 또는 형식 오류를 빌드와 런타임에서 알기 쉽게 처리한다.

AI 작업 프롬프트:

```txt
apps/blog/src/lib/posts.ts를 GitHub 콘텐츠 클라이언트 기반으로 전환해줘.
기존 페이지와 컴포넌트가 깨지지 않도록 getAllPosts, getPostBySlug 같은
공개 함수 형태와 Post 타입은 최대한 유지해줘. published: false 글은
제외하고, 기존 src/lib/mdx.ts 파싱 로직을 재사용해줘.
```

완료 기준:

- 홈 페이지가 GitHub repo의 공개 포스트 목록을 사용한다.
- 상세 페이지가 GitHub repo의 개별 MDX를 사용한다.
- 기존 로컬 MDX 파일이 없어도 운영 콘텐츠를 읽을 수 있다.

## 5. App Router 페이지를 ISR에 맞게 조정

새 글이 빌드 이후에 추가되어도 첫 요청에서 생성될 수 있도록 동적 파라미터와
캐시 정책을 조정합니다.

- [ ] `/posts/[slug]` 페이지에 `dynamicParams = true`를 적용한다.
- [ ] `generateStaticParams()`는 유지하되 GitHub 포스트 목록을 사용한다.
- [ ] 없는 글, 비공개 글, 삭제된 글은 `notFound()`로 처리한다.
- [ ] 홈 페이지가 `posts` cache tag가 붙은 데이터를 사용한다.
- [ ] 상세 페이지가 `post:{slug}` cache tag가 붙은 데이터를 사용한다.

AI 작업 프롬프트:

```txt
Next.js App Router의 /posts/[slug] 페이지를 ISR과 런타임 GitHub 콘텐츠
조회에 맞게 조정해줘. dynamicParams = true를 사용하고,
generateStaticParams는 GitHub 기반 getAllPosts를 사용하게 해줘.
없는 글이나 published: false 글은 notFound() 처리해줘.
```

완료 기준:

- 빌드 시점 이후 추가된 slug도 첫 요청에서 렌더링될 수 있다.
- 삭제된 포스트는 상세 페이지에서 404로 처리된다.
- 기존 정적 생성 동작과 런타임 재검증 동작이 함께 동작한다.

## 6. GitHub webhook signature 검증 구현

GitHub webhook 요청이 실제 GitHub에서 온 것인지 확인하는 검증 유틸리티를
추가합니다. 검증은 JSON 파싱 전에 raw body 기준으로 수행합니다.

- [ ] `apps/blog/src/lib/github-webhook.ts`를 추가한다.
- [ ] `X-Hub-Signature-256` 헤더를 읽는다.
- [ ] `GITHUB_WEBHOOK_SECRET`과 raw body로 HMAC-SHA256을 계산한다.
- [ ] `crypto.timingSafeEqual` 또는 동등한 constant-time 비교를 사용한다.
- [ ] secret 누락, signature 누락, signature 불일치를 구분해 처리한다.

AI 작업 프롬프트:

```txt
GitHub webhook signature 검증 유틸리티를 구현해줘.
apps/blog/src/lib/github-webhook.ts에 verifyGitHubWebhookSignature 함수를
추가하고, X-Hub-Signature-256 헤더와 raw request body를
GITHUB_WEBHOOK_SECRET으로 HMAC-SHA256 검증해줘. 비교는 timingSafeEqual을
사용하고, 오류 처리는 Route Handler에서 403으로 응답하기 쉽게 설계해줘.
```

완료 기준:

- 올바른 signature는 통과한다.
- 잘못된 signature는 거부된다.
- raw body가 변조되면 검증이 실패한다.

## 7. Webhook Route Handler 구현

GitHub content repo의 push 이벤트를 받아 관련 캐시를 무효화하는 Route
Handler를 추가합니다.

- [ ] `apps/blog/src/app/api/webhooks/github-content/route.ts`를 추가한다.
- [ ] `POST` 요청만 처리한다.
- [ ] raw body로 signature를 검증한다.
- [ ] `X-GitHub-Event`가 `push`인지 확인한다.
- [ ] push payload에서 `added`, `modified`, `removed` 파일 목록을 읽는다.
- [ ] `posts/*.mdx` 변경 파일에서 slug를 추출한다.
- [ ] `revalidateTag('posts')`를 호출한다.
- [ ] 변경된 slug마다 `revalidateTag('post:{slug}')`를 호출한다.
- [ ] 홈 경로 `/`를 `revalidatePath('/')`로 무효화한다.
- [ ] 변경된 slug마다 `/posts/{slug}`를 `revalidatePath()`로 무효화한다.
- [ ] 처리 결과를 JSON으로 응답한다.

AI 작업 프롬프트:

```txt
apps/blog/src/app/api/webhooks/github-content/route.ts를 구현해줘.
GitHub webhook push 이벤트를 받고, signature 검증 후 변경된 posts/*.mdx
파일에서 slug를 추출해 revalidateTag('posts'),
revalidateTag(`post:${slug}`), revalidatePath('/'),
revalidatePath(`/posts/${slug}`)를 호출해줘. logger를 사용해 처리 결과와
오류를 기록하고, console.log는 사용하지 마.
```

완료 기준:

- GitHub push webhook이 200 응답을 받는다.
- 잘못된 signature는 403 응답을 받는다.
- 변경된 포스트 slug 목록이 응답 JSON과 로그에 남는다.
- 삭제된 포스트도 목록과 상세 경로가 재검증된다.

## 8. 이미지 처리 정책 구현

초기 구현은 GitHub raw URL을 사용하고, 필요하면 이후 `attachments`
프록시 Route Handler로 개선합니다.

- [ ] Obsidian에서 사용할 이미지 삽입 규칙을 정한다.
- [ ] MDX 내부 이미지 경로가 운영 환경에서 렌더링되는지 확인한다.
- [ ] 초기에는 absolute raw GitHub URL 또는 `/attachments/*` 중 하나를
      선택한다.
- [ ] `/attachments/*`를 선택하면 이미지 프록시 Route Handler를 추가한다.
- [ ] Next.js image 설정이 필요한지 확인한다.

AI 작업 프롬프트:

```txt
GitHub 콘텐츠 저장소의 attachments 이미지를 Next.js 블로그에서 표시하는
방식을 구현해줘. 초기 구현은 단순해야 하며, Obsidian 작성 경험을 해치지
않아야 해. raw GitHub URL 방식과 /attachments 프록시 방식 중 이
프로젝트에 더 적합한 방식을 선택하고 필요한 코드와 문서를 추가해줘.
```

완료 기준:

- Obsidian에서 작성한 이미지가 블로그 상세 페이지에서 보인다.
- 이미지 경로 규칙이 콘텐츠 작성자가 이해할 수 있게 문서화되어 있다.
- 외부 이미지 도메인이 필요하면 Next.js 설정에 반영되어 있다.

## 9. Obsidian 작성 워크플로우 문서화

작성자가 매번 같은 형식으로 글을 만들 수 있도록 Obsidian 사용 절차를
문서화합니다.

- [ ] Obsidian Vault에 content repo를 clone하는 방법을 문서화한다.
- [ ] `posts/` 디렉터리에 글을 만드는 방법을 문서화한다.
- [ ] frontmatter 템플릿을 제공한다.
- [ ] Obsidian Git 플러그인 또는 터미널 push 절차를 문서화한다.
- [ ] 초안은 `published: false`로 관리한다고 명시한다.

AI 작업 프롬프트:

```txt
Obsidian에서 GitHub 콘텐츠 저장소를 사용해 블로그 글을 작성하는
워크플로우 문서를 작성해줘. Vault에 repo를 clone하고, posts/*.mdx를
만들고, frontmatter 템플릿을 사용하고, Obsidian Git으로 commit/push하는
절차를 포함해줘. 초안은 published: false로 관리한다고 설명해줘.
```

완료 기준:

- 새 글 작성자가 별도 설명 없이 글을 만들고 push할 수 있다.
- frontmatter 템플릿이 문서에 포함되어 있다.
- 이미지 저장 위치와 링크 방식이 설명되어 있다.

## 10. GitHub webhook 등록

콘텐츠 저장소에서 push 이벤트가 발생하면 운영 블로그 서버의 webhook
endpoint를 호출하도록 GitHub 설정을 추가합니다.

- [ ] GitHub content repo의 **Settings**로 이동한다.
- [ ] **Webhooks**에서 새 webhook을 추가한다.
- [ ] Payload URL을 입력한다.
- [ ] Content type을 `application/json`으로 설정한다.
- [ ] Secret을 `GITHUB_WEBHOOK_SECRET`과 같은 값으로 설정한다.
- [ ] 이벤트는 push event만 선택한다.
- [ ] 테스트 delivery가 200을 반환하는지 확인한다.

Payload URL 예시는 다음과 같습니다.

```txt
https://byeoung.dev/api/webhooks/github-content
```

AI 작업 프롬프트:

```txt
GitHub content repo에서 Next.js 블로그의 webhook endpoint로 push 이벤트를
보내기 위한 설정 절차를 문서화해줘. Payload URL, content type,
secret, push event 선택, delivery 로그 확인 방법을 포함해줘.
```

완료 기준:

- GitHub webhook delivery 로그에서 200 응답을 확인한다.
- 잘못된 secret으로 보낸 테스트 요청은 403이 된다.
- push 이벤트 외 이벤트는 처리하지 않는다.

## 11. 테스트 추가

캐시 무효화와 GitHub 콘텐츠 로딩은 운영 영향이 크므로 핵심 동작을 테스트로
보강합니다.

- [ ] GitHub 파일 경로에서 slug를 추출하는 함수를 테스트한다.
- [ ] webhook signature 검증 성공과 실패를 테스트한다.
- [ ] push payload에서 변경된 post slug를 추출하는 함수를 테스트한다.
- [ ] `published: false` 글이 제외되는지 테스트한다.
- [ ] GitHub API 404 응답 처리 방식을 테스트한다.

AI 작업 프롬프트:

```txt
GitHub content repo 연동과 webhook revalidation을 위한 핵심 유틸리티
테스트를 추가해줘. slug 추출, GitHub webhook signature 검증,
push payload에서 changed slug 추출, published: false 필터링,
GitHub API 404 처리를 테스트해줘. 이 저장소의 기존 테스트 도구와
패턴을 먼저 확인하고 맞춰서 구현해줘.
```

완료 기준:

- signature 검증 테스트가 성공과 실패 케이스를 모두 포함한다.
- 변경 파일 목록에서 `posts/*.mdx`만 slug로 추출한다.
- 테스트가 기존 프로젝트 명령으로 실행된다.

## 12. 로컬 검증

구현 후 로컬에서 빌드와 주요 흐름을 확인합니다.

- [ ] `apps/blog/`에서 `pnpm lint`를 실행한다.
- [ ] `apps/blog/`에서 `pnpm build`를 실행한다.
- [ ] 개발 서버를 실행한다.
- [ ] 홈 페이지에서 GitHub repo 포스트 목록을 확인한다.
- [ ] 상세 페이지에서 GitHub repo 포스트 본문을 확인한다.
- [ ] 잘못된 webhook signature 요청이 403인지 확인한다.
- [ ] 올바른 webhook payload가 cache revalidation을 호출하는지 확인한다.

AI 작업 프롬프트:

```txt
GitHub API + ISR + webhook revalidation 구현을 로컬에서 검증해줘.
apps/blog에서 pnpm lint와 pnpm build를 실행하고, 개발 서버에서 홈과
상세 페이지가 GitHub 콘텐츠를 읽는지 확인해줘. webhook endpoint는
올바른 signature와 잘못된 signature 케이스를 모두 확인해줘.
```

완료 기준:

- `pnpm lint`가 통과한다.
- `pnpm build`가 통과한다.
- 홈과 상세 페이지가 GitHub 콘텐츠를 렌더링한다.
- webhook endpoint가 인증된 요청만 처리한다.

## 13. 운영 배포 검증

운영 서버에서 webhook과 ISR 흐름이 실제로 동작하는지 확인합니다.

- [ ] 운영 환경 변수 값을 설정한다.
- [ ] Docker 이미지를 다시 빌드하고 배포한다.
- [ ] GitHub webhook delivery가 운영 URL에서 200인지 확인한다.
- [ ] Obsidian에서 새 글을 push한다.
- [ ] 홈 페이지에서 새 글이 보이는지 확인한다.
- [ ] 새 상세 페이지가 첫 요청에서 생성되는지 확인한다.
- [ ] 기존 글 수정 후 내용이 갱신되는지 확인한다.
- [ ] 글 삭제 후 목록 제거와 상세 404를 확인한다.

AI 작업 프롬프트:

```txt
운영 서버에서 GitHub API + ISR + webhook revalidation 배포 검증
체크리스트를 수행해줘. 환경 변수 확인, Docker 재배포, GitHub webhook
delivery 확인, 새 글 추가, 기존 글 수정, 글 삭제 시나리오를 순서대로
검증하고 결과를 요약해줘.
```

완료 기준:

- 새 글 추가에 전체 애플리케이션 재배포가 필요하지 않다.
- webhook 호출 후 다음 요청에서 최신 콘텐츠가 반영된다.
- 실패 시 logger와 GitHub delivery 로그로 원인을 추적할 수 있다.

## 14. 후속 개선

초기 구현이 안정화된 뒤 운영 편의성과 성능을 개선합니다.

- [ ] GitHub API rate limit 모니터링을 추가한다.
- [ ] 이미지 프록시와 장기 캐싱을 구현한다.
- [ ] MDX compile 결과 캐싱 전략을 점검한다.
- [ ] webhook 실패 시 재시도 또는 알림 방식을 추가한다.
- [ ] 콘텐츠 frontmatter 스키마 검증을 `zod` 등으로 강화한다.
- [ ] draft, scheduled publish, canonical URL 같은 작성 기능을 추가한다.

AI 작업 프롬프트:

```txt
현재 GitHub API + ISR + webhook revalidation 구현의 후속 개선 항목을
설계해줘. GitHub API rate limit, 이미지 프록시 캐싱, MDX compile 캐싱,
webhook 실패 알림, frontmatter 스키마 검증, 예약 발행을 중심으로
우선순위와 구현 난이도를 정리해줘.
```

완료 기준:

- 운영 중 병목과 장애 지점을 추적할 수 있다.
- 이미지와 MDX 렌더링 비용이 예측 가능하다.
- 콘텐츠 작성 경험이 Obsidian 중심으로 유지된다.
