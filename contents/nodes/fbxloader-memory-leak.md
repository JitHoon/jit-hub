---
slug: "fbxloader-memory-leak"
title: "FBXLoader 메모리 누수"
cluster: "discovery"
difficulty: "intermediate"
prerequisites: []
relatedConcepts:
  - slug: "chrome-devtools-memory"
    relationship: "discoveredBy"
  - slug: "cesium-adoption"
    relationship: "ledTo"
childConcepts: []
tags: ["memory-leak", "three.js", "fbxloader", "chrome-devtools", "gc"]
---

# FBXLoader 메모리 누수

## 한 줄 요약

고객사 시연 중 3D 모델 페이지에서 OOM 크래시가 반복 발생했다. Chrome DevTools Memory 프로파일링으로 Three.js FBXLoader의 참조 체인이 끊기지 않는 구조적 문제를 발견하고, dispose()로 Retained Size를 3배 감소시켰지만 근본 해결은 불가능했다. 이 경험이 Cesium 전환의 결정적 계기가 됐다.

## 고객사 시연 중 크래시가 발생했다

드론 기반 3D 점검 SaaS의 3D 모델 페이지(Inspection2d)에 진입할 때마다 메모리가 10.5MB에서 105MB로 약 10배 증가했다. 페이지를 벗어나도 이 메모리가 해제되지 않고 누적됐다.

이 문제는 **고객사 앞에서의 서비스 시연 중 크래시**로 드러났다. 브라우저 탭이 흰 화면과 함께 자동 리로드되는 현상이 반복적으로 발생하면서 시연이 중단됐다. Chrome의 OOM(Out of Memory) 보호 메커니즘이 작동한 것으로, 탭의 메모리 사용량이 브라우저가 허용하는 한계를 초과했다는 뜻이었다.

시연 중 크래시는 단순한 기술 문제가 아니라 **비즈니스 임팩트**가 있는 사건이었다. 이 문제를 해결하지 않으면 고객사 데모를 진행할 수 없었다.

## 원인 추적 과정

### 처음에 의심한 것: 렌더링 로직

메모리 문제라는 직감은 있었지만, 처음에는 렌더링 로직의 비효율이 원인이라고 생각했다. 불필요한 리렌더링이 메모리를 소모하고 있을 거라는 가설이었다. 그러나 렌더링 최적화를 시도해도 메모리 누적 패턴은 변하지 않았다.

### Chrome DevTools Memory 프로파일링

문제를 계기로 "These 5 Bad JavaScript Practices Will Lead to Memory Leaks" 아티클(javascript.plainenglish.io)을 참고하여 Allocation instrumentation on timeline 기능의 사용법을 체계적으로 익혔다.

핵심은 **녹화 방식의 설계**에 있었다. 단순히 한 번 페이지를 열어보는 것이 아니라, 실제 사용자의 반복적 행동 패턴을 재현했다:

```
프로젝트 페이지 → 3D 모델 페이지 → 프로젝트 페이지 → 3D 모델 페이지 (반복)
```

정상적인 경우라면 페이지를 떠날 때 메모리가 감소해야 한다. 그러나 녹화 결과에서는 **메모리가 계속 누적되기만 하는 패턴**이 확인됐다.

### Shallow Size vs Retained Size로 범인 특정

Snapshot 표에서 각 Constructor를 열어보며 분석했을 때, **Three.js의 FBXLoader**가 원인으로 특정됐다.

핵심 단서는 두 가지 수치의 극단적 불균형이었다:

- **Shallow Size** (객체 자신의 크기): 작음
- **Retained Size** (이 객체가 참조하는 전체 객체 트리의 크기): 비정상적으로 큼

이 불균형이 의미하는 것은, FBXLoader 객체 자체는 작지만, 이 객체가 **참조 체인을 통해 거대한 메모리 트리를 붙잡고 있어서 가비지 컬렉터(GC)가 해당 메모리를 회수하지 못한다**는 것이었다.

### 코드 레벨에서의 확인

3D 뷰어 컴포넌트의 useEffect 내에서 `new FBXLoader()`로 FBX 데이터를 로드하여 뷰어에 추가하는 로직이 있었다. 해당 useEffect를 주석 처리하고 다시 Snapshot을 녹화했을 때, 급격한 메모리 사용 막대가 나타나지 않았다.

특히 **FBX 모델 로드 실패 시 리로드하는 과정**이 치명적이었다. 로드에 실패한 메모리는 GC에 의해 정리되지 않은 채 유지되면서, 새로운 로드 시도가 추가 메모리를 누적시켰다.

## 해결 시도: dispose()

컴포넌트가 unmount된 이후에 모든 텍스처와 모델에 대해 `.dispose()`를 호출하는 코드를 추가했다:

- **Function Retained Size**: 2,280,144 → 771,263 (**3배 감소**)
- **Worker Retained Size**: 1,827,488 → 324,659 (**5배 감소**)

Chrome DevTools Memory 탭에서 측정한 수치다.

### 왜 이것만으로는 부족했는가

dispose()로 참조 체인은 일부 끊었지만, **메모리 변동폭 자체가 개선되지 않았다**. 3D 모델 페이지를 반복 방문하면 여전히 메모리가 누적되었고, 충분히 반복하면 결국 크래시로 이어졌다. Three.js의 FBXLoader 내부에서 발생하는 근본적인 메모리 관리 문제를 외부에서 완전히 통제하는 것은 불가능했다.

## 단순한 기술 문제가 아니었다

FBXLoader 메모리 누수는 결국 **기존 뷰어에서 Cesium.js로의 전면 전환**이라는 결정으로 이어졌다. 이 결정은 메모리 문제 하나만으로 이루어진 것이 아니라 다섯 가지 요인이 복합적으로 작용했다:

1. **메모리 문제의 구조적 한계**: dispose()로도 메모리 변동폭이 개선되지 않음
2. **비즈니스 요구사항**: 고객사가 Point Cloud뿐 아니라 Mesh 시각화를 필수로 요구
3. **개발 자유도**: 기존 뷰어는 커스텀 기능 개발과 디자인 적용이 제한적
4. **포맷 지원 범위**: 건설 업계의 다양한 파일 포맷 지원 부족
5. **Three.js의 한계**: Three.js는 범용 3D 렌더링 라이브러리로, 좌표계 변환·지형 배치·2D/3D 지도 전환 등 지리공간(Geospatial) 기능이 내장되어 있지 않다. 1인 개발 제약에서 이 기능들을 직접 구현하는 것은 불가능했다

전환 후 메모리 누적 문제는 해소됐다. 170MB 이상 누적되던 패턴이 안정 범위 내로 유지됐다. 이 전환 과정의 상세는 cesium-adoption 노드에서 다룬다.

## 이 경험에서 추출한 원칙

1. **"현상"이 아니라 "재현 시나리오"를 먼저 설계하라.** "느리다"가 아니라, "반복적 페이지 전환"이라는 구체적 시나리오가 있어야 문제를 측정할 수 있다.

2. **Shallow Size와 Retained Size의 불균형은 참조 체인 누수의 강력한 신호다.** 객체 자체는 작은데 Retained가 비정상적으로 크면, 그 객체가 GC를 방해하는 참조 사슬의 시작점이다.

3. **라이브러리의 구조적 한계는 사용법 개선으로 해결되지 않는다.** 도구 자체를 교체하는 결정이 필요한 시점이 있다. 다만 교체 결정은 기술적 이유 하나가 아니라, 비즈니스 요구사항·개발 자유도·생태계 지원 범위를 함께 고려한 복합적 판단이어야 한다.

메모리 누수가 의심된다면, Chrome DevTools Memory 탭에서 페이지 이동 전후의 Retained Size를 비교해 보라.
