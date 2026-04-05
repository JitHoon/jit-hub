# LOC 효율성 & 지표 이해

## 이 문서의 위치

> **심화 탐구 워크북** — 01-project-dashboard 리뷰에서 도출
> 현재 문서: **deep-dives/03-loc-efficiency**
> 관련 원본 문서: [01-project-dashboard](../01-project-dashboard.md), [05-core-code-review](../05-core-code-review.md)

## 배경

대시보드 리뷰 포인트 #3 + #8:

- #3: "이 프로젝트에 필요한 LOC 값이 정말 4,644만큼이나 필요한지 의문이 들었고, 이를 극한으로 줄여보고 싶다."
- #8: "'하네스 .md / 소스 LOC' 가 어떤 지표인지 이해가 안 된다."

현재 src/ 디렉토리에 약 5,174줄의 TypeScript/TSX 코드가 있다. 이 중 어디가 가장 크고, 압축 가능한 부분은 어디인지 코드 감사를 수행한다. 또한 "하네스 문서 71개 / 소스 4,644줄 = 소스 65줄당 하네스 문서 1개"라는 비율 지표의 의미와 활용법을 이해한다.

## 분석 목표

- src/ 디렉토리별 LOC 분포 분석
- 가장 큰 파일 Top 10 식별 및 압축 가능성 평가
- 데드 코드, 과도한 추상화, 중복 탐색
- "하네스 .md / 소스 LOC" 지표의 의미와 활용법
- 최소 LOC 목표 설정 및 리팩토링 후보 목록 도출

## 분석 / 학습 내용

(Session 3에서 채워넣을 영역)

## 결론

(Session 3에서 채워넣을 영역)

## 참조 파일

- `src/features/graph/hooks/` — 922줄, 가장 큰 디렉토리
- `src/features/content/` — 1,196줄
- `05-core-code-review.md` — 핵심 코드 리뷰 분석

## 액션 아이템

- [ ] (Session 3에서 도출)
