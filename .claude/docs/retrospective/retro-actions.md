# Retrospective Action Items

7일 프로젝트 회고(01~17 + deep-dives)에서 도출한 모든 액션. 하나씩 체크하며 진행.
원본 번호는 `archive/` 문서 번호 참조.

---

## 즉시 (XS, 30분 이내)

| # | 작업 | 원본 | 상태 |
|---|------|------|------|
| 1 | think-reviewer 2.md 중복 파일 삭제 | 02,11,16 | [x] |
| 2 | code-reviewer Agent에 graph-visualization Skill 추가 | 02,11,16 | [x] |
| 3 | Skill별 allowed-tools 차별화 검토 | 02,16 | [x] |
| 4 | `features/theme/hooks/useTheme.ts` re-export 미사용 시 삭제 | deep/03 | [x] |
| 5 | Lighthouse 4개 카테고리 베이스라인 점수 측정 및 기록 | 01,08,16 | [x] |
| 6 | Google Search Console 인덱싱 상태 확인 | 09 | [x] |
| 7 | JSON-LD 유효성 검증 (Google Rich Results Test) | 09 | [x] |
| 8 | 다크모드 전환 시 미세 깜빡임 최종 점검 | 14 | [x] |
| 9 | hydration 버그 패턴을 library-practices Skill에 추가 | 12 | [x] |
| 10 | PR 템플릿에 "변경 사유" 필드 추가 | 10 | [x] |

---

## 단기 (S, 1~2일)

### 테스트 보강

| # | 작업 | 원본 | 상태 |
|---|------|------|------|
| 11 | 콘텐츠 파이프라인 통합 테스트 (Zod 검증→JSON 생성 전체 흐름) | 07,11,16 | [x] |
| 12 | 그래프 빌더 유닛 테스트 확장 (순환 참조, 고립 노드 엣지 케이스) | 07 | [x] |
| 13 | 모바일 viewport E2E 테스트 추가 (768px 이하) | 07 | [x] |
| 14 | axe-core 기반 접근성 자동 테스트 도입 | 07,09,16 | [x] |
| 15 | Lighthouse CI 통합으로 성능 회귀 방지 | 07,08,16 | [x] |
| 16 | 유닛 테스트 커버리지 리포트 생성 (vitest --coverage) | 07 | [x] |

### 성능 & 번들

| # | 작업 | 원본 | 상태 |
|---|------|------|------|
| 17 | @next/bundle-analyzer 도입 + 번들 구성 시각화 | 01,04,08,16 | [x] |
| 18 | three.js tree shaking 가능 여부 조사 | 08,16 | [x] |
| 19 | 폰트 서브셋팅 적용 (한글 폰트) | 08,11,16 | [x] |

### 디자인 시스템

| # | 작업 | 원본 | 상태 |
|---|------|------|------|
| 27 | 애니메이션 토큰 정의 (duration, easing 표준화) | 14 | [x] |

---

## 중기 (M, 1주)

| # | 작업 | 원본 | 상태 |
|---|------|------|------|
| 28 | GraphCanvas3D 컴포넌트 분해 (렌더링 로직 분리) | 04,11,16 | [ ] |
| 29 | InstancedMesh 적용 PoC (노드 수 증가 대비) | 08,16 | [ ] |
| 30 | 3D 그래프 키보드 탐색 구현 | 09,16 | [ ] |
| 31 | deep/03 LOC 리팩토링 일괄 실행 (공유 상수 추출, 함수 통합, ref 정리 등 ~20건) | deep/03 | [ ] |
| 32 | 범용 모듈 추출 대상 결합도 분석 (content-pipeline, theme-system, error-boundary-kit) | 16 | [ ] |
| 33 | 하네스 템플릿 패키지 MVP 구조 설계 | 16 | [ ] |
