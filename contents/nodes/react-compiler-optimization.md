---
slug: "react-compiler-optimization"
title: "React Compiler로 렌더링 성능 76% 개선"
cluster: "performance"
difficulty: "advanced"
prerequisites:
  - "chrome-devtools-memory"
relatedConcepts:
  - slug: "chrome-devtools-memory"
    relationship: "measuredBy"
  - slug: "cesium-mouse-events"
    relationship: "appliedTo"
childConcepts: []
tags: ["react-compiler", "performance", "rendering", "memoization", "profiling"]
---

# React Compiler로 렌더링 성능 76% 개선

## 한 줄 요약

3D 뷰어에서 툴바 클릭, 타임시리즈 전환 등 사용자 인터랙션마다 불필요한 리렌더링이 연쇄 발생하여 최대 1,228ms의 지연이 생겼다. React Compiler를 도입하여 코드 변경 없이 빌드 타임 자동 메모이제이션을 적용한 결과, 타임시리즈 전환 76%, 툴바 인터랙션 67%의 렌더링 시간 감소를 달성했다.

## 3D 뷰어에서 리렌더링이 문제가 된 이유

3D 뷰어는 일반 웹 앱과 다르다. 상태 하나가 변경되면 Cesium 엔티티 업데이트, 툴바 UI 갱신, 사이드 패널 데이터 동기화가 동시에 발생한다. 단일 상태 변경이 하위 컴포넌트 전체의 재렌더링을 유발하는 패턴이었다.

Chrome DevTools Performance 탭에서 Main thread flame chart를 분석한 결과, 세 가지 병목을 확인했다:

1. **툴바 인터랙션**: 측정 도구 전환 시 195ms 소요, 11프레임 드랍
2. **타임시리즈 전환**: 날짜별 3D 모델 전환 시 1,228ms 소요. 캐스케이딩 렌더가 480ms를 차지
3. **투명도 슬라이더**: 조작 시 메인 스레드 점유율 58.7%. 슬라이더 동작이 끊기는 체감

이 문제의 근본 원인은 React의 렌더링 모델에 있었다. 부모 컴포넌트가 리렌더링되면 모든 자식 컴포넌트가 함께 리렌더링된다. 3D 뷰어처럼 깊은 컴포넌트 트리에서는 이 연쇄 비용이 크다.

## 세 가지 해결 선택지

| 선택지 | 장점 | 단점 | 우리 상황에서의 판단 |
|--------|------|------|---------------------|
| React.memo/useMemo 수동 적용 | 즉시 적용 가능 | 누락 위험, 유지보수 부담 증가 | 컴포넌트 수가 많아 수동 관리 비현실적 |
| 상태 구조 리팩토링 | 근본적 해결 | 작업량 방대, 기존 기능 회귀 위험 | 장기적으로 필요하나 즉시 적용 어려움 |
| **React Compiler** | **코드 변경 없이 빌드 타임 자동 메모이제이션** | 실험적 기술, 순수 함수 전제 | **최종 선택** |

수동 메모이제이션은 100개 이상의 컴포넌트에 일일이 적용해야 하며, 하나라도 누락하면 효과가 반감된다. 상태 리팩토링은 근본적이지만, 운영 중인 서비스에서 전면 리팩토링은 위험이 크다.

React Compiler는 빌드 타임에 컴포넌트와 훅의 반환값을 자동으로 메모이제이션한다 (React 공식 블로그, react.dev/blog). 코드 변경 없이 즉시 효과를 볼 수 있다는 점이 결정적이었다.

## 적용 결과

Chrome DevTools Performance 탭에서 동일 시나리오를 Compiler 적용 전후로 측정한 결과:

| 지표 | 적용 전 | 적용 후 | 개선 |
|------|--------|--------|------|
| 툴바 인터랙션 | 195ms | 63ms | **67%↓** |
| 프레임 드랍 | 11프레임 | 3프레임 | **70%↓** |
| 투명도 슬라이더 메인 스레드 | 58.7% | 46.4% | **21%↓** |
| 타임시리즈 전환 | 1,228ms | 298ms | **76%↓** |
| 캐스케이딩 렌더 | 480ms | 0ms | **100% 제거** |
| 전환 시 메모리 오버헤드 | +50MB | +25MB | **51%↓** |

가장 인상적인 결과는 캐스케이딩 렌더의 완전 제거다. Compiler가 중간 컴포넌트의 불필요한 리렌더링을 차단하면서, 상태 변경이 실제로 영향받는 컴포넌트에만 전달됐다.

## Compiler가 해결하지 못하는 경우

React Compiler는 순수 함수 컴포넌트에서 가장 효과적이다. 다음 경우에는 Compiler의 최적화가 제한된다:

- **외부 상태 라이브러리(Zustand, Jotai)에 의존하는 리렌더링**: Compiler가 외부 스토어의 변경을 추적하지 못한다
- **useRef를 통한 명령형 조작**: Cesium의 ScreenSpaceEventHandler 같은 명령형 API 호출은 Compiler 최적화 범위 밖이다
- **동적 컴포넌트 생성**: `createElement`로 런타임에 생성되는 컴포넌트는 빌드 타임 분석이 불가능하다

이 경우 상태 구조 리팩토링이 근본 해결책이 된다. Compiler는 "즉시 적용 가능한 최적화"이고, 상태 리팩토링은 "장기적 근본 해결"이다.

## chrome-devtools-memory 노드와의 연결

이 최적화의 출발점은 chrome-devtools-memory 노드에서 다룬 프로파일링 방법론이었다. Performance 탭에서 리렌더링 병목을 식별하고, 최적화 전후를 동일 조건에서 측정하는 습관이 이번에도 적용됐다.

## 이 경험에서 추출한 원칙

1. **"코드를 고치지 않고 성능을 개선할 수 있는가?"를 먼저 물어라.** 빌드 도구, 번들러, 컴파일러 레벨의 최적화는 코드 변경 없이 즉시 효과를 준다. 코드 레벨 최적화는 그 다음이다.

2. **측정 없는 최적화는 추측이다.** "느린 것 같다"가 아니라 "195ms에서 63ms로 줄었다"가 되어야 한다. Chrome DevTools Performance 탭은 이 측정의 필수 도구다.

3. **3D 환경의 렌더링 최적화는 일반 웹 앱과 다르다.** 컴포넌트 트리가 깊고 상태 변경의 파급 범위가 넓다. 수동 메모이제이션으로 관리할 수 있는 규모를 넘어서면, 자동화된 접근(Compiler)이 필요하다.

현재 React 앱에서 리렌더링 병목이 의심된다면, React DevTools Profiler에서 "Highlight updates when components render" 옵션을 켜고 인터랙션을 수행해 보라. 불필요하게 깜빡이는 컴포넌트가 보인다면 최적화 대상이다.

## 공식 문서

- [React Compiler 공식 문서 (react.dev)](https://react.dev/learn/react-compiler) — React Compiler 작동 원리, 설정 방법, 제약 조건 공식 설명
- [React DevTools Profiler 사용 가이드](https://react.dev/reference/react/Profiler) — 렌더링 병목 측정과 Profiler API 공식 레퍼런스
