# GitHub Actions Playwright CI 연동

## 워크플로우 구조 (Phase 7에서 적용)

기존 CI 워크플로우에 Playwright 단계를 추가한다.

```yaml
# .github/workflows/ci.yml 에 추가할 job/step

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: bun run test:e2e

- name: Upload Playwright Report
  uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

## CI 환경 설정

`playwright.config.ts`에서 CI 분기:

```ts
forbidOnly: !!process.env.CI,      // CI에서 .only() 방지
retries: process.env.CI ? 2 : 0,   // CI에서 flaky 재시도
workers: process.env.CI ? 1 : undefined, // CI에서 직렬 실행
reporter: process.env.CI ? 'github' : 'html',
```

## webServer CI 모드

로컬에서는 `bun run dev` (Turbopack dev 서버)를 사용하지만,
CI에서는 프로덕션 빌드 테스트가 더 정확하다:

```ts
webServer: {
  command: process.env.CI ? 'bun run build && bun run start' : 'bun run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

## 주의사항

- Playwright 브라우저는 Chromium만 설치 (`--with-deps chromium`)
- `actions/upload-artifact@v4` 사용 (v3은 deprecated)
- `if: ${{ !cancelled() }}` — 테스트 실패해도 리포트 업로드
- `retention-days: 7` — 포트폴리오 프로젝트에서 7일이면 충분
