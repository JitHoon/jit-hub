# 프로젝트 중간 회고 가이드

3D GIS 지식 포트폴리오 프로젝트의 7일간(2026-03-30 ~ 04-05) 경험을 체계화한 회고 문서 모음.

## 프로젝트 요약

| 항목 | 값 |
|------|------|
| 기간 | 7일 |
| 커밋 | 222 (main) |
| PR | 26 |
| LOC | 4,644 |
| 콘텐츠 노드 | 21 |
| 하네스 | 11 Skills, 13 Agents, 12 Commands, 6 Hooks |

## 회고 프레임워크

**"사실 → 분석 → 성찰 → 행동"** 순서로 진행한다. 객관적 데이터를 먼저 정리한 뒤, 기술적 분석을 거쳐, 주관적 성찰로 이어지고, 마지막에 액션 아이템을 도출한다.

## 권장 읽기 순서

문서 번호순이 아닌, 아래 Tier 순서로 읽는 것을 권장한다.

### Tier 1: 맥락 파악

프로젝트의 규모와 의사결정을 이해하는 출발점.

| 순서 | 문서 | 핵심 질문 |
|------|------|----------|
| 1 | [01-project-dashboard](./01-project-dashboard.md) | 무엇을 얼마나 만들었는가? |
| 2 | [06-decision-timeline](./06-decision-timeline.md) | 왜 이런 선택을 했는가? |
| 3 | [03-ai-collaboration-patterns](./03-ai-collaboration-patterns.md) | AI와 어떻게 협업했는가? |

### Tier 2: 구현 분석

아키텍처와 핵심 코드 구현을 분석.

| 순서 | 문서 | 핵심 질문 |
|------|------|----------|
| 4 | [04-architecture-maturity](./04-architecture-maturity.md) | 아키텍처 설계 품질은? |
| 5 | [05-core-code-review](./05-core-code-review.md) | 핵심 코드에서 무엇을 배웠는가? |
| 6 | [02-harness-engineering](./02-harness-engineering.md) | 하네스 구축 과정과 효과는? |

### Tier 3: 프로세스 품질

개발 프로세스와 품질 관리를 평가.

| 순서 | 문서 | 핵심 질문 |
|------|------|----------|
| 7 | [10-workflow-efficiency](./10-workflow-efficiency.md) | 개발 워크플로우가 효율적이었는가? |
| 8 | [07-testing-strategy](./07-testing-strategy.md) | 테스트 전략이 적절했는가? |
| 9 | [08-performance-bundle](./08-performance-bundle.md) | 성능 베이스라인은? |
| 10 | [09-seo-accessibility](./09-seo-accessibility.md) | SEO/접근성 효과는? |

### Tier 4: 시스템 성숙도

디자인 시스템, 문서, 에러 처리, 부채를 평가.

| 순서 | 문서 | 핵심 질문 |
|------|------|----------|
| 11 | [14-design-system-maturity](./14-design-system-maturity.md) | 디자인 시스템이 견고한가? |
| 12 | [15-documentation-quality](./15-documentation-quality.md) | 문서가 실제로 효과적이었는가? |
| 13 | [12-error-handling-patterns](./12-error-handling-patterns.md) | 에러 처리가 체계적인가? |
| 14 | [11-tech-debt-inventory](./11-tech-debt-inventory.md) | 어떤 부채가 남아있는가? |

### Tier 5: 성찰 & 액션

모든 분석을 바탕으로 성찰하고 액션을 도출.

| 순서 | 문서 | 핵심 질문 |
|------|------|----------|
| 15 | [13-reflection](./13-reflection.md) | 나는 무엇을 느꼈고 배웠는가? |
| 16 | [16-enhancement-roadmap](./16-enhancement-roadmap.md) | 이제 무엇을 개선할 것인가? |
| 17 | [17-next-project-checklist](./17-next-project-checklist.md) | 다음 프로젝트에 무엇을 적용할 것인가? |

## 각 문서의 구조

모든 문서는 동일한 구조를 따른다:

```
# 제목
## 이 문서의 위치       ← Tier, 읽기 순서, 이전/다음 링크
## 개요                 ← 이 회고의 목적
## (본문 섹션들)        ← 데이터, 분석, 평가
## 심화 탐구 가이드     ← 더 파고들 때의 체크리스트, 관련 파일, 관련 문서
## 액션 아이템          ← 구체적 다음 행동
```

## 활용 방법

### 심화 탐구 워크북

대시보드 리뷰 등에서 도출된 심화 분석은 [deep-dives/](./deep-dives/) 폴더에서 관리한다.

### 처음 읽을 때
Tier 1 → 2 → 3 → 4 → 5 순서로 통독. 각 문서의 개요와 핵심 평가를 중심으로 빠르게 훑는다.

### 심화 회고 시
각 문서의 **심화 탐구 가이드** 체크리스트를 하나씩 수행하며, 관련 소스 파일을 직접 분석한다.

### 13-reflection 작성 시
Tier 1~4의 모든 문서를 완료한 후, 13번 문서의 프레임워크를 채워넣는다. 솔직한 감정과 구체적 사례를 포함한다.

### 다음 프로젝트 시작 시
17번 체크리스트를 Day 0에 열어보고, 해당 프로젝트에 맞게 커스터마이즈한다.
