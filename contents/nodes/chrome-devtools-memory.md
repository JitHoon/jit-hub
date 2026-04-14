---
slug: "chrome-devtools-memory"
title: "Chrome DevTools 메모리 프로파일링"
cluster: "discovery"
difficulty: "intermediate"
prerequisites: []
relatedConcepts:
  - slug: "fbxloader-memory-leak"
    relationship: "discovered"
  - slug: "react-compiler-optimization"
    relationship: "ledTo"
  - slug: "cesium-mouse-events"
    relationship: "validates"
  - slug: "measurement-tools"
    relationship: "validates"
childConcepts: []
tags: ["chrome-devtools", "memory-profiling", "performance", "gc", "debugging"]
---

# Chrome DevTools 메모리 프로파일링

## 한 줄 요약

고객사 시연 중 OOM 크래시가 발생했을 때 "어디서 얼마나 새는지" 알 수 없었다. Performance 탭으로 메모리 급증 구간을 좁히고, Memory 탭의 Allocation instrumentation으로 FBXLoader를 범인으로 특정했다. 이 프로파일링 방법론은 Cesium 전환 후에도 이벤트 누수 검증 도구로 계속 사용 중이다.

## 코드를 읽어서는 찾을 수 없는 문제

고객사 시연 중 흰 화면 크래시가 반복적으로 발생했을 때, "메모리가 문제인 것 같다"는 직감은 있었지만, **어디서 얼마나 새는지** 알 수 없었다. 수천 줄의 3D 렌더링 코드에서 어떤 객체가 GC를 방해하고 있는지는 도구 없이 특정할 수 없다.

이 문제를 계기로 "These 5 Bad JavaScript Practices Will Lead to Memory Leaks" 아티클(javascript.plainenglish.io)을 참고하여 JavaScript의 GC 메커니즘과 DevTools 프로파일링 기능의 사용법을 체계적으로 익혔다.

## 2단계 프로파일링 방법론

### 1단계: Performance 탭 — 이상 구간을 좁힌다

Performance 탭은 "무엇이 문제인가"를 특정하기 전에, **"문제가 있는 구간이 어디인가"**를 찾는 데 사용한다.

실제 사용자의 반복적 행동 패턴을 재현하며 녹화한다:

```
프로젝트 페이지 → 3D 모델 페이지 → 프로젝트 페이지 → 3D 모델 페이지 (반복)
```

관찰 지표:
- **JS Heap 크기 추이**: 페이지를 떠날 때 감소해야 정상. 계속 우상향하면 누수 의심
- **이벤트 등록 추이**: 페이지 전환 후에도 해제되지 않고 누적되면 이벤트 핸들러 누수

### 2단계: Memory 탭 — 문제 객체를 특정한다

Performance에서 이상 구간을 발견한 뒤, Memory 탭의 **Allocation instrumentation on timeline**으로 구체적인 원인 객체를 식별한다.

Snapshot 표에서 각 Constructor를 열어보며 두 가지 수치를 비교한다:

- **Shallow Size**: 객체 자신의 크기
- **Retained Size**: 이 객체가 GC되면 함께 해제될 전체 메모리

핵심 패턴은 **Shallow Size는 작은데 Retained Size가 비정상적으로 큰 객체**를 찾는 것이다. "이 객체 자체는 작지만, 거대한 메모리 트리를 참조하고 있어서 GC가 전체를 회수하지 못하고 있다"는 뜻이다.

이 방법으로 Three.js FBXLoader를 원인으로 특정했다. 상세 과정은 fbxloader-memory-leak 노드에서 다룬다.

## Prod vs Dev 환경의 메모리 차이

프로파일링 과정에서 동일한 작업임에도 환경에 따라 메모리 수치가 크게 달랐다:

| 환경 | 메모리 | 차이 원인 |
|------|--------|----------|
| Prod | ~170MB | 실제 운영 수치 |
| Dev | ~700MB | React Strict Mode의 useEffect 이중 실행, 소스맵, DevTools 오버헤드 |

메모리 프로파일링 시 Dev 환경에서 Strict Mode를 일시적으로 끄면 Prod에 가까운 수치를 얻을 수 있다.

## 마이그레이션 이후에도 계속 사용하는 도구

이 프로파일링 방법론은 Cesium.js 전환 이후에도 계속 활용하고 있다. 측정 도구, 이슈 CRUD 등의 기능을 추가할 때마다 **이벤트가 등록됐다가 제대로 해제되는지**를 확인한다.

또한 이 도구로 발견한 리렌더링 병목이 react-compiler-optimization 노드에서 다루는 React Compiler 도입의 출발점이 됐다. Performance 탭에서 불필요한 리렌더링 패턴을 식별하고, 최적화 전후를 동일 조건에서 측정하는 습관이 Compiler 도입 효과를 정량화하는 데 직접 활용됐다.

## 이 경험에서 추출한 원칙

1. **Performance로 구간을 좁히고, Memory로 객체를 특정하라.** 처음부터 Memory 탭으로 들어가면 데이터가 너무 많아 방향을 잃는다.

2. **Shallow Size와 Retained Size의 불균형이 핵심 단서다.** 작은 객체가 거대한 Retained Size를 가지고 있다면, 그 객체가 참조 체인의 시작점이다.

3. **프로파일링은 일회성이 아니라 습관이다.** 새 기능 추가 시마다 이벤트 등록/해제를 검증하는 루틴으로 발전시켜야 같은 실수를 반복하지 않는다.

프로젝트에서 "느리다"는 체감이 있다면, Chrome DevTools Performance 탭을 열고 사용자의 반복 행동 패턴을 녹화해 보라. 메모리 그래프가 우상향하는 구간이 보인다면 누수 가능성이 있다.

## 공식 문서

- [Chrome DevTools Memory 패널 공식 가이드](https://developer.chrome.com/docs/devtools/memory-problems) — Heap snapshot, Allocation instrumentation 상세 설명
- [Chrome DevTools Performance 패널 공식 가이드](https://developer.chrome.com/docs/devtools/performance) — 메모리 타임라인, flame chart 분석 방법
