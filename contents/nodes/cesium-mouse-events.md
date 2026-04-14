---
slug: "cesium-mouse-events"
title: "명령형 Cesium API를 React 선언형 모델에 통합하기"
cluster: "feature"
difficulty: "advanced"
prerequisites:
  - "cesium-adoption"
relatedConcepts:
  - slug: "measurement-tools"
    relationship: "provides"
  - slug: "chrome-devtools-memory"
    relationship: "validatedBy"
  - slug: "react-compiler-optimization"
    relationship: "optimizedBy"
childConcepts: []
tags: ["cesium", "event-handling", "react", "imperative-declarative", "custom-hook", "pub-sub", "architecture"]
---

# 명령형 Cesium API를 React 선언형 모델에 통합하기

## 한 줄 요약

Cesium의 마우스 이벤트 핸들러를 React 컴포넌트 안에 등록했는데, 컴포넌트가 언마운트되어도 이벤트가 계속 발생했다. 메모리 누수와 의도하지 않은 동작이 반복됐다. 세 가지 패턴 — 컴포넌트 라이프사이클 바인딩, Hook-per-Entity 추상화, 커스텀 이벤트 버스 — 으로 해결했고, 이 패턴 적용 후 페이지 전환 시 이전 페이지의 이벤트 잔류 문제가 완전히 제거됐다.

## 선언형과 명령형의 충돌

**React는 선언형**: "무엇이 보여야 하는가"를 기술하면 React가 DOM을 관리한다.

**Cesium의 ScreenSpaceEventHandler는 명령형**: 이벤트를 직접 등록하고, 사용이 끝나면 직접 해제해야 한다. 해제를 빠뜨리면 이벤트 핸들러가 잔류하여 메모리 누수와 이벤트 충돌을 일으킨다.

## 패턴 1: 컴포넌트 마운트/언마운트 = 이벤트 등록/해제

각 도구를 독립된 React 컴포넌트로 구현하여, **컴포넌트의 마운트/언마운트가 곧 이벤트의 등록/해제**가 되도록 설계했다.

"거리 측정" 도중에 "면적 측정"을 누르면: 거리 컴포넌트 언마운트(이벤트 해제 + 임시 엔티티 정리) → 면적 컴포넌트 마운트(이벤트 등록). **이벤트를 언제 등록/해제할 것인가**라는 명령형 문제를 **어떤 컴포넌트가 화면에 있는가**라는 선언형 문제로 변환한 것이다.

## 패턴 2: Hook-per-Entity 추상화

3D 공간의 동적 엔티티(점, 선, 라벨)를 각각 독립된 커스텀 훅으로 캡슐화했다. 도구 컴포넌트는 Cesium Entity API를 직접 호출하지 않는다:

```
도구 컴포넌트 (DistanceTool, AreaTool, ...)
  └── 커스텀 훅 조합
        ├── useDynamicPoint     → 커서 따라다니는 점
        ├── useDynamicLine      → 실시간 미리보기 선
        └── useMeasureLines     → 확정된 측정선 목록
```

새 도구 추가 시 기존 훅을 조합하기만 하면 된다. "수직·수평 거리" 도구는 동적 선 훅 3개(대각선, 수직, 수평)를 조합하여 구현했다.

## 패턴 3: 커스텀 이벤트 버스

Profile(단면도) 도구에서 메인 뷰어와 별도 뷰어 간 실시간 동기화가 필요했다. React의 상태 트리만으로는 처리가 어려워, **싱글톤 이벤트 매니저(Pub/Sub)**로 해결했다. 발행자와 구독자가 서로를 몰라도 된다.

이 렌더링 성능은 react-compiler-optimization 노드에서 다루는 React Compiler로 추가 최적화됐다.

## 이 경험에서 추출한 원칙

1. **명령형 API를 선언형 모델 안에 흡수하라.** 이것은 Cesium뿐 아니라 D3, Canvas, WebGL 같은 명령형 라이브러리를 React에서 사용할 때 일반적으로 적용 가능한 패턴이다.

2. **추상화의 단위는 "도구"가 아니라 "엔티티"다.** 엔티티(점, 선, 라벨) 단위로 추상화하면 도구는 "훅의 조합"이 되어 일관성과 재사용성을 동시에 얻는다.

3. **React 상태 관리의 한계를 인식하고, 보완적 시스템을 설계하라.** 3D 렌더링 엔진의 이벤트는 UI 계층을 따르지 않으므로 Pub/Sub 같은 별도 통신 채널이 필요할 수 있다.

Cesium(또는 Three.js, D3)을 React에서 사용하고 있다면, 명령형 리소스의 생성/해제가 컴포넌트 라이프사이클에 바인딩되어 있는지 확인하라. useEffect cleanup에서 해제되지 않는 리소스가 있다면 메모리 누수 대상이다.
