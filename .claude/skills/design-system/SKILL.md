---
name: design-system
description: UI 컴포넌트 구현, 색상/타이포/간격 적용, 테마 전환 작업 시 활성화. 디자인 토큰, 팔레트, 킥 컬러 규칙 제공.
allowed-tools: Read, Grep, Glob
---

# 디자인 시스템 Skill — Modern Gray + Nintendo Retro Kick

## 디자인 철학

- **그레이 베이스**: 차분하고 프로페셔널한 인상. 킥 컬러가 포인트로 시선 유도
- **킥 컬러 절제**: 면적 최소화, 성숙하게 사용. 유치하면 안 됨
- **금지**: 글래스모피즘, 네온 글로우, 과한 그라데이션, 과한 애니메이션

## 토큰 구조

| 파일 | 역할 |
|------|------|
| `src/lib/tokens.ts` | KICK, Palette(LIGHT/DARK), FONT, GRAPH_GRAY — JS에서 직접 참조 |
| `src/lib/clusters.ts` | 9개 클러스터 HEX 색상 + base(킥 계열) — 그래프 캔버스용 |
| `src/app/globals.css` | CSS 변수 — Tailwind/컴포넌트에서 참조 |

## 킥 컬러 4색

| 이름 | HEX | 출처 |
|------|---------|------|
| Red | #E60012 | 닌텐도 레드 |
| Blue | #0058A6 | 수퍼패미컴 블루 |
| Green | #00A651 | 게임보이 그린 |
| Yellow | #FFC800 | 닌텐도 골드 |

## 클러스터 색상 규칙

- 9개 클러스터는 4개 킥 컬러에서 명도/채도 변형으로 파생
- 각 클러스터에 `base` 필드가 있어 킥 계열 추적 가능
- 그래프 캔버스는 `clusters.ts`의 HEX 값 직접 사용 (CSS 변수 아님)
- 기본 상태: 모노크롬 그레이 → 호버 시 킥 컬러 리빌 (0.25s ease)

## 팔레트 사용 규칙

- 라이트/다크 모드는 `html.dark` 클래스 기반 전환
- CSS에서는 시맨틱 변수 사용: `--color-bg`, `--color-surface`, `--color-text` 등
- JS(그래프 캔버스)에서는 `tokens.ts`의 `getPalette(dark)` 또는 `getGraphGray(dark)` 사용
- 하드코딩된 색상값 금지 — 반드시 토큰 참조

## 타이포그래피

- **Display**: Lexend (`var(--font-lexend)`) — 영문 헤딩, 로고
- **Body**: Noto Sans KR (`var(--font-noto-kr)`) — 한국어 본문
- **Mono**: `ui-monospace, 'SF Mono', 'Fira Code', monospace` — 코드 블록만

## 아이콘

- 외부 아이콘 라이브러리 미사용 — 커스텀 SVG 컴포넌트로 관리
- 위치: `src/components/icons/`
- 파일명: `{Name}Icon.tsx` (PascalCase + Icon 접미사)
- Props: `size` (number, 기본 20), `className` (string, 선택)
- SVG 기본 속성: `stroke="currentColor"`, `fill="none"`, `viewBox="0 0 24 24"`
- 색상은 `currentColor`를 통해 부모의 `color`를 상속
- `index.ts`에서 named export로 re-export

## 그래프 인터랙션 패턴

- **컬러 리빌**: 기본 모노크롬 → 호버 시 클러스터 킥 컬러 (transition 0.25s)
- **플로팅**: float-a/b/c 3가지 궤도, 5~9.8초 주기, 노드별 고유 딜레이
- **호버 정지**: `animationPlayState: paused` + `scale(1.1)` + glow shadow
- **그래프 배경**: 라이트 `#F0F0F0` / 다크 `#0E0E0E` + 도트 그리드

## 상세 레퍼런스

필요 시 아래 파일을 읽어라:

- `references/token-catalog.md` — 전체 토큰 값 + 사용처 매핑
- `references/component-patterns.md` — 뱃지, 태그, 분할뷰 등 UI 패턴
