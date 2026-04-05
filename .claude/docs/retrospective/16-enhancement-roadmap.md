# 16. 프로젝트 고도화 방향

## 이 문서의 위치

> **Tier 5: 성찰 & 액션** — 모든 분석을 바탕으로 성찰하고 액션을 도출
>
> 📍 현재 문서: **16-enhancement-roadmap** (16/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → 08 → 09 → 14 → 15 → 12 → 11 → 13 → **16** → 17
>
> 이전: [13-reflection](./13-reflection.md) · 다음: [17-next-project-checklist](./17-next-project-checklist.md)

## 개요

기능 추가가 아닌, 기존 코드 최적화 + 하네스 엔지니어링 고도화 + 범용 플러그인 생성에 초점을 맞춘 고도화 로드맵.

---

## A. 기존 코드 최적화

### A-1. 성능 최적화

| 항목 | 현재 | 목표 | 복잡도 |
|------|------|------|--------|
| three.js 번들 크기 | 전체 포함 | tree shaking 적용 | 중 |
| 노드 렌더링 | 개별 Mesh | InstancedMesh | 중 |
| 폰트 로딩 | 전체 | 서브셋 (한글+라틴) | 낮 |
| 이미지 최적화 | 기본 | next/image 활용 | 낮 |
| Lighthouse 점수 | 미측정 | 90+ 전 카테고리 | 중 |

### A-2. 코드 품질 강화

| 항목 | 현재 | 목표 | 복잡도 |
|------|------|------|--------|
| 유닛 테스트 | 5개 | 주요 유틸 전수 커버 | 중 |
| 통합 테스트 | 0개 | 파이프라인 전체 흐름 | 중 |
| 접근성 테스트 | 0개 | axe-core 자동화 | 낮 |
| 성능 회귀 CI | 없음 | Lighthouse CI | 중 |
| GraphCanvas3D 분해 | 단일 컴포넌트 | 역할별 분리 | 중 |

### A-3. 접근성 강화

| 항목 | 현재 | 목표 |
|------|------|------|
| 3D 그래프 키보드 탐색 | 미구현 | 노드 간 Tab 이동 |
| prefers-reduced-motion | 미지원 | 애니메이션 비활성화 |
| 색상 대비 | 미검증 | WCAG AA 충족 |
| aria-live 알림 | 미구현 | 노드 선택 시 알림 |
| 포커스 인디케이터 | 기본값 | 커스텀 포커스 링 |

---

## B. 하네스 엔지니어링 고도화

### B-1. 즉시 해결 (부채 상환)

| 항목 | 작업 내용 |
|------|----------|
| 중복 파일 삭제 | think-reviewer 2.md 제거 |
| Skill 보강 | code-reviewer에 graph-visualization Skill 추가 |
| allowed-tools 차별화 | 스킬별 필요 도구만 허용 |

### B-2. 메모리 시스템 구축

| 항목 | 설명 |
|------|------|
| MEMORY.md | 프로젝트 상태, 사용자 프로필, 반복 피드백 기록 |
| 세션 간 컨텍스트 | UserPromptSubmit 훅으로 이전 세션 요약 주입 |
| 학습 기록 | 발견한 gotchas, 해결한 버그 패턴 자동 축적 |

### B-3. 하네스 자가진단

| 항목 | 설명 |
|------|------|
| /health 커맨드 | 하네스 무결성 검사 (누락 필드, 중복 파일, 비참조 스킬) |
| Skill 로딩 검증 | 조건부 컨텍스트가 실제로 활성화되는지 확인 |
| Hook 효과 측정 | 각 훅이 잡아낸 이슈 수 로깅 |

### B-4. 워크플로우 고도화

| 항목 | 설명 |
|------|------|
| /retrospective 커맨드 | 이 회고 프레임워크를 커맨드로 자동화 |
| /scaffold 커맨드 | 새 프로젝트 스캐폴딩 (하네스 기본 구조 포함) |
| CI 통합 훅 | PR 생성 시 자동으로 Lighthouse/테스트 실행 |

---

## C. 범용 플러그인 생성

### C-1. 이 프로젝트에서 추출 가능한 범용 모듈

| 모듈 | 추출 대상 | 범용화 수준 |
|------|----------|------------|
| content-pipeline | gray-matter + Zod 검증 + JSON 생성 | 높음 |
| theme-system | useSyncExternalStore + localStorage + DOM 동기화 | 높음 |
| error-boundary-kit | FeatureBoundary (ErrorBoundary + Suspense + Skeleton) | 높음 |
| webgl-check | WebGL 지원 체크 + 폴백 UI | 중간 |
| design-token-bridge | CSS 변수 ↔ JS 상수 이중 체계 | 중간 |

### C-2. 하네스 템플릿 패키지

다음 프로젝트에서 Day 1부터 사용할 수 있는 하네스 템플릿:

```
.claude-template/
├── CLAUDE.md.template          # 조건부 컨텍스트 로딩 골격
├── settings.json.template      # 기본 권한 + 필수 훅
├── rules/
│   └── code-style.md.template  # TypeScript strict, Tailwind 규칙
├── skills/
│   ├── clean-code/             # 범용 (프로젝트 무관)
│   ├── library-practices/      # 스택별 커스터마이즈
│   └── harness-engineering/    # 범용 (프로젝트 무관)
├── agents/
│   ├── code-reviewer.md        # 범용
│   ├── test-runner.md          # 범용
│   └── pr-creator.md           # 범용
└── commands/
    ├── review.md               # 범용
    ├── test.md                 # 범용
    └── create-pr.md            # 범용
```

### C-3. 범용화 기준

| 기준 | 설명 |
|------|------|
| 프로젝트 독립적 | 3D GIS 특화 내용 제거 가능 |
| 스택 커스터마이즈 가능 | Next.js → Remix 등 교체 가능한 구조 |
| 즉시 사용 가능 | 설치 후 바로 작동 (추가 설정 최소화) |
| 점진적 확장 가능 | 필요한 것만 추가하는 구조 |

---

## 고도화 우선순위 로드맵

### Phase 1: 부채 상환 + 측정 (1~2일)
1. 하네스 부채 즉시 해결 (중복 파일 삭제, Skill 보강)
2. Lighthouse 베이스라인 측정
3. 번들 분석 실행
4. 접근성 자동 테스트 도입

### Phase 2: 코드 품질 + 테스트 (2~3일)
1. 유닛 테스트 확장
2. 통합 테스트 추가
3. GraphCanvas3D 분해
4. 성능 회귀 CI 구축

### Phase 3: 하네스 고도화 (2~3일)
1. 메모리 시스템 구축
2. 하네스 자가진단 커맨드
3. 워크플로우 커맨드 추가

### Phase 4: 범용 모듈 추출 (3~5일)
1. content-pipeline 범용 모듈
2. theme-system 범용 모듈
3. error-boundary-kit 범용 모듈
4. 하네스 템플릿 패키지

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] 범용 모듈 5개의 추출 가능성을 실제 코드에서 결합도 분석으로 검증
- [ ] 하네스 템플릿 패키지의 최소 구성 요소(MVP) 정의
- [ ] 각 고도화 Phase의 예상 소요 시간을 이번 프로젝트 생산성 데이터 기반으로 추정
- [ ] 고도화 vs 새 프로젝트 시작의 ROI 비교

### 관련 소스 파일
- `src/features/theme/` — theme-system 추출 대상
- `src/features/content/` — content-pipeline 추출 대상
- `src/components/FeatureBoundary.tsx` — error-boundary-kit 추출 대상

### 관련 회고 문서
- [11-tech-debt-inventory](./11-tech-debt-inventory.md) — 고도화 전 해결할 부채 목록
- [02-harness-engineering](./02-harness-engineering.md) — 하네스 고도화 대상
- [17-next-project-checklist](./17-next-project-checklist.md) — 고도화 결과가 반영될 체크리스트

## 액션 아이템

- [ ] Phase 1 즉시 시작 (부채 상환)
- [ ] 범용 모듈 추출 대상 구체화
- [ ] 하네스 템플릿 구조 설계
- [ ] 고도화 progress.md 작성
