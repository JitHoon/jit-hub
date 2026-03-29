---
slug: "chrome-devtools-memory"
title: "Chrome DevTools 메모리 프로파일링"
cluster: "problem"
difficulty: "intermediate"
prerequisites: []
relatedConcepts:
  - slug: "fbxloader-memory-leak"
    relationship: "discovered"
  - slug: "cesium-mouse-events"
    relationship: "validates"
  - slug: "measurement-tools"
    relationship: "validates"
childConcepts: []
tags: ["chrome-devtools", "memory-profiling", "performance", "gc", "debugging"]
---

# Chrome DevTools 메모리 프로파일링

## 한 줄 요약

Chrome DevTools의 Performance 탭으로 전체 메모리 흐름을 파악하고, Memory 탭의 Allocation instrumentation on timeline으로 문제 객체를 식별하는 2단계 프로파일링 방법론. 3D 뷰어 마이그레이션의 시작점이었고, 이후 Cesium 기반 기능 개발에서도 이벤트 누수 검증 도구로 계속 사용 중이다.

---

## 왜 이 도구가 필요했는가

고객사 시연 중 흰 화면 크래시가 반복적으로 발생했을 때, "메모리가 문제인 것 같다"는 직감은 있었지만, **어디서 얼마나 새는지** 알 수 없었다. 코드를 눈으로 읽어서 찾을 수 있는 문제가 아니었다 — 수천 줄의 3D 렌더링 코드에서 어떤 객체가 GC를 방해하고 있는지는 도구 없이 특정할 수 없다.

DevTools Memory 탭 자체는 이전에도 알고 있는 도구였지만, 이 문제를 계기로 처음으로 체계적으로 사용했다. "These 5 Bad JavaScript Practices Will Lead to Memory Leaks" 아티클(javascript.plainenglish.io)을 참고하여 JavaScript의 GC 메커니즘(스택/힙 메모리, 참조 카운팅, 마크 앤 스윕)과 DevTools 프로파일링 기능의 사용법을 익혔다.

## 2단계 프로파일링 방법론

### 1단계: Performance 탭 — 전체 흐름을 본다

Performance 탭은 "무엇이 문제인가"를 특정하기 전에, **"문제가 있는 구간이 어디인가"**를 찾는 데 사용한다.

녹화를 시작하고 실제 사용자의 행동 패턴을 재현한다:

```
프로젝트 페이지 → 3D 모델 페이지 → 프로젝트 페이지 → 3D 모델 페이지 (반복)
```

이 패턴으로 녹화하면서 관찰하는 지표들:

- **JS Heap 크기 추이**: 정상이라면 페이지를 떠날 때 감소해야 한다. 감소 없이 계속 우상향하면 누수 의심.
- **전체 메모리 사용량**: JS Heap 외에 DOM 노드, 이벤트 리스너 등이 포함된 전체 메모리.
- **이벤트 등록 추이**: 이벤트 리스너가 페이지 전환 후에도 해제되지 않고 누적되면, 이벤트 핸들러가 참조하는 객체도 함께 누수된다.

Performance 탭의 역할은 **"여기가 수상하다"는 구간을 좁히는 것**이다. 예를 들어, "3D 모델 페이지에 진입할 때마다 메모리가 200MB씩 튀고, 페이지를 떠나도 100MB밖에 안 내려온다"는 패턴을 발견하면, 다음 단계로 넘어간다.

### 2단계: Memory 탭 — 문제 객체를 식별한다

Performance에서 이상 구간을 발견한 뒤, Memory 탭의 **Allocation instrumentation on timeline**으로 **구체적으로 어떤 객체가 메모리를 잡아먹고 있는지** 식별한다.

녹화 방식은 Performance와 동일하게 반복적 페이지 방문 패턴을 사용한다. 녹화가 끝나면 Snapshot 표에서 각 Constructor(생성자)를 열어보며 두 가지 수치를 비교한다:

**Shallow Size**: 객체 자신의 크기(바이트). 이 객체가 직접 사용하는 메모리.

**Retained Size**: 이 객체가 GC되면 함께 해제될 수 있는 전체 메모리. 이 객체가 참조 체인을 통해 붙잡고 있는 모든 하위 객체를 포함한 크기.

핵심 패턴은 **Shallow Size는 작은데 Retained Size가 비정상적으로 큰 객체**를 찾는 것이다. 이 불균형은 "이 객체 자체는 작지만, 거대한 메모리 트리를 참조하고 있어서 GC가 그 전체를 회수하지 못하고 있다"는 뜻이다.

실제로 이 방법으로 Three.js FBXLoader가 원인임을 특정했다. 뷰어 컴포넌트의 useEffect에서 FBX를 로드하는 로직을 주석 처리하고 다시 녹화했을 때 메모리 급증이 사라지는 것으로 최종 확인했다.

## Prod vs Dev 환경의 메모리 차이

프로파일링 과정에서 동일한 작업임에도 환경에 따라 메모리 수치가 크게 달랐다:

- **Prod 환경**: ~170MB
- **Dev 환경**: ~700MB

이 차이의 주요 원인 중 하나는 **React Strict Mode**로 추정된다. React의 개발 모드에서 Strict Mode는 useEffect를 의도적으로 두 번 실행하여 cleanup이 제대로 되는지 검출한다. 3D 모델 로딩처럼 무거운 작업이 이중으로 실행되면서 Dev 환경의 메모리가 부풀었을 가능성이 높다. 그 외에도 Dev 빌드의 소스맵, React DevTools 오버헤드 등이 추가 요인일 수 있다.

메모리 프로파일링 시 이런 환경 차이가 수치를 왜곡할 수 있으므로, **Dev 환경에서 Strict Mode를 일시적으로 끄고 프로파일링**하면 Prod에 가까운 수치를 얻을 수 있다. 상용 환경에서 문제를 확인하려 하는 것은 이미 늦은 것이므로, Dev 환경을 정확한 측정 조건으로 만드는 것이 올바른 접근이다.

## 마이그레이션 이후에도 계속 사용하는 도구

FBXLoader 문제 해결을 위해 처음 제대로 익힌 이 프로파일링 방법론은, Cesium.js로 전환한 이후에도 **지속적으로 활용하고 있다.**

특히 Cesium 기반으로 측정 도구, 이슈 CRUD 등의 기능을 하나씩 추가할 때마다, DevTools Memory를 열어 **이벤트가 등록됐다가 제대로 해제되는지**를 확인했다. Cesium의 `ScreenSpaceEventHandler`로 클릭/더블클릭/우클릭 이벤트를 등록하면, 기능을 끄거나 페이지를 떠날 때 반드시 해제해야 한다. 해제하지 않으면 이벤트 핸들러가 참조하는 Cesium 엔티티, 콜백 함수, 상태 객체가 모두 메모리에 남게 된다.

이 검증 루틴은 현재도 새 기능을 추가할 때마다 수행하고 있으며, FBXLoader에서 겪은 메모리 누수를 Cesium 환경에서 반복하지 않기 위한 방어적 개발 습관이 되었다.

## 이 경험에서 추출한 원칙

1. **Performance로 구간을 좁히고, Memory로 객체를 특정하라.** 처음부터 Memory 탭으로 들어가면 데이터가 너무 많아 방향을 잃는다. Performance에서 "메모리가 튀는 구간"을 먼저 찾는 것이 효율적이다.

2. **Shallow Size와 Retained Size의 불균형이 핵심 단서다.** 작은 객체가 거대한 Retained Size를 가지고 있다면, 그 객체가 참조 체인의 시작점이다.

3. **프로파일링은 일회성이 아니라 습관이다.** 문제를 해결한 뒤에도, 새 기능 추가 시마다 이벤트 등록/해제를 검증하는 루틴으로 발전시켜야 같은 실수를 반복하지 않는다.

---

## 연결된 노드

- **→ FBXLoader 메모리 누수** (이 도구로 발견한 문제)
- **→ Cesium 마우스 이벤트 처리** (이 도구로 이벤트 누수를 검증하는 대상)
- **→ 측정 도구 7종** (이벤트 등록/해제 검증이 필요한 기능)
