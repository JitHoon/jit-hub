# 11. 기술 부채 인벤토리

## 이 문서의 위치

> **Tier 4: 시스템 성숙도** — 디자인 시스템, 문서, 에러 처리, 부채를 평가
>
> 📍 현재 문서: **11-tech-debt-inventory** (14/17)
>
> **권장 읽기 순서**: 01 → 06 → 03 → 04 → 05 → 02 → 10 → 07 → 08 → 09 → 14 → 15 → 12 → **11** → 13 → 16 → 17
>
> 이전: [12-error-handling-patterns](./12-error-handling-patterns.md) · 다음: [13-reflection](./13-reflection.md)

## 개요

7일 스프린트에서 의도적으로 지거나 무의식적으로 쌓인 기술 부채를 명시적으로 목록화한다.

## 부채 인벤토리

### 높은 우선순위 (고도화 시 반드시 해결)

| # | 부채 | 위치 | 영향 | 해결 복잡도 |
|---|------|------|------|------------|
| 1 | think-reviewer 에이전트 중복 파일 | .claude/agents/think-reviewer 2.md | 혼란 유발 | 낮 |
| 2 | 유닛 테스트 부족 | src/ 전반 | 회귀 리스크 | 중 |
| 3 | 콘텐츠 파이프라인 통합 테스트 부재 | src/lib/, src/features/content/ | 빌드 실패 감지 늦음 | 중 |

### 중간 우선순위 (품질 개선)

| # | 부채 | 위치 | 영향 | 해결 복잡도 |
|---|------|------|------|------------|
| 5 | GraphCanvas3D 컴포넌트 복잡도 | src/features/graph/components/ | 유지보수 어려움 | 중 |
| 6 | 접근성 미검증 영역 | 3D 그래프, 색상 대비 | 사용자 배제 | 중~높 |
| 7 | 성능 베이스라인 미측정 | 전체 | 회귀 감지 불가 | 낮 |
| 8 | 번들 분석 미수행 | 전체 | 불필요한 코드 포함 가능 | 낮 |
| 9 | code-reviewer Agent에 Skill 누락 | .claude/agents/code-reviewer.md | 불완전한 리뷰 | 낮 |
| 10 | Skill allowed-tools 미차별화 | .claude/skills/ | 불필요한 도구 노출 | 낮 |

### 낮은 우선순위 (점진 개선)

| # | 부채 | 위치 | 영향 | 해결 복잡도 |
|---|------|------|------|------------|
| 11 | 메모리 시스템 미구축 | .claude/ | 세션 간 컨텍스트 단절 | 중 |
| 12 | i18n 미준비 | 전체 | 영어 확장 시 대규모 작업 | 높 |
| 13 | 폰트 서브셋팅 미적용 | 한글 폰트 | 로딩 성능 | 낮 |
| 14 | prefers-reduced-motion 미지원 | 3D 애니메이션 | 접근성 | 낮 |
| 15 | Storybook 커버리지 부족 | src/stories/ | 디자인 시스템 문서화 | 중 |

## 의도적 vs 비의도적 부채

### 의도적 부채 (MVP 스코프 결정)
- 검색 기능 보류 (21개 노드 → 그래프 탐색만으로 충분)
- 프로젝트 섹션 보류 (MVP 범위 외)
- i18n 보류 (한국어 우선)
- 성능 최적화 일부 보류 (InstancedMesh 등)

### 비의도적 부채 (주의 부족)
- think-reviewer 중복 파일
- 접근성 검증 누락
- 성능 베이스라인 미측정

## 부채 상환 우선순위

```
즉시 (1시간 이내):
  ├── think-reviewer 중복 파일 삭제
  └── code-reviewer Skill 추가

단기 (1~2일):
  ├── 유닛 테스트 확장 (파이프라인, 빌더)
  ├── Lighthouse 베이스라인 측정
  └── 번들 분석 실행

중기 (1주):
  ├── GraphCanvas3D 컴포넌트 분해
  ├── 접근성 자동 테스트 도입
  └── 성능 회귀 CI 구축
```

## 심화 탐구 가이드

### 이 회고를 더 깊이 파고들 때 확인할 것
- [ ] `grep -r "as " src/ --include="*.ts" --include="*.tsx"`로 타입 단언 사용 빈도 측정
- [ ] 하드코딩된 매직 넘버/문자열 검색 (색상값, URL, 크기 등)
- [ ] 미사용 export/import 검사 (eslint no-unused-vars 외 도구)
- [ ] 각 부채의 "방치 비용" 정량화 (시간이 지날수록 해결 비용 증가하는가?)

### 관련 소스 파일
- `.claude/agents/think-reviewer 2.md` — 중복 파일 (삭제 대상)
- `src/features/graph/components/` — GraphCanvas3D 복잡도
- `.claude/agents/code-reviewer.md` — Skill 누락 확인

### 관련 회고 문서
- [07-testing-strategy](./07-testing-strategy.md) — 테스트 부족 부채 상세
- [08-performance-bundle](./08-performance-bundle.md) — 성능 관련 부채
- [16-enhancement-roadmap](./16-enhancement-roadmap.md) — 부채 상환 로드맵

## 액션 아이템

- [ ] 즉시 해결 가능한 부채 3건 처리
- [ ] 단기 부채 해결 Phase 계획 수립
- [ ] 부채 추적 시스템 도입 검토 (progress.md에 부채 섹션 추가)
