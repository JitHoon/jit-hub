---
name: playwright-testing
description: E2E 테스트 작성/실행 시 사용. Playwright 테스트 패턴, fixture 구조, CI 연동 관련 작업에 활성화.
allowed-tools: Read, Grep, Glob
---

## 테스트 구조

```
test/
└── e2e/
    ├── *.spec.ts          ← 테스트 파일 (기능 단위)
    └── fixtures/
        └── test-helpers.ts ← 공통 헬퍼
```

- 테스트 파일명: `{기능}.spec.ts` (kebab-case)
- 하나의 spec 파일 = 하나의 기능 영역
- `@smoke` 태그: 빠른 검증용 최소 테스트 셋

## 핵심 패턴

### 테스트 작성 원칙

- **사용자 행동** 단위로 테스트 — 구현 디테일이 아닌 결과를 검증
- CSS selector보다 `data-testid` 속성 활용
- URL 쿼리 파라미터(`?node=slug`)로 상태 설정 — 직접 클릭보다 안정적

### 페이지 로딩 대기

```ts
// Good: 특정 요소 대기
await page.locator('[data-testid="graph-container"]').waitFor();

// Bad: networkidle은 불안정
await page.waitForLoadState('networkidle');
```

### canvas 기반 그래프 테스트

react-force-graph-2d는 canvas 기반이라 DOM selector로 노드를 직접 찾을 수 없다.

- canvas 요소 존재 + 크기 확인으로 렌더링 검증
- 노드 선택은 URL 파라미터(`?node=slug`)로 우회
- 상세 전략: `references/canvas-testing.md`

### dev 서버 연동

`playwright.config.ts`의 `webServer` 설정으로 `bun run dev` 자동 시작.
`reuseExistingServer: !process.env.CI`로 로컬에서는 기존 서버 재활용.

## Gotchas

- **Bun 러너 호환성**: Playwright 테스트 러너가 Bun에서 불안정할 수 있음 → `bunx`로 시도, 실패 시 `npx` fallback
- **canvas DOM 불가**: react-force-graph-2d 노드를 DOM selector로 찾을 수 없음 → URL 기반 상태 검증
- **networkidle 불안정**: Turbopack HMR WebSocket이 계속 연결 유지 → `waitFor()` 사용
- **Vercel Hobby 실행 불가**: Playwright는 CI(GitHub Actions)에서만 자동 실행
- **webServer timeout**: Turbopack 초기 빌드에 시간 소요 → `timeout: 120_000` 설정
- **Chromium만 설치**: 포트폴리오 규모에서 Firefox/WebKit은 과도 → `npx playwright install chromium`

## 실행 방법

```bash
bun run test:e2e           # 전체 테스트
bun run test:e2e:headed    # 브라우저 창 표시
bun run test:e2e:ui        # Playwright UI 모드
```

## 상세 레퍼런스

- canvas 기반 컴포넌트 테스트 → `references/canvas-testing.md`
- GitHub Actions CI 연동 → `references/ci-integration.md`
