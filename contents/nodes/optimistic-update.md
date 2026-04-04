---
slug: "optimistic-update"
title: "낙관적 업데이트"
cluster: "frontend"
difficulty: "advanced"
prerequisites:
  - "cesium-mouse-events"
relatedConcepts:
  - slug: "cesium-mouse-events"
    relationship: "builtOn"
childConcepts: []
tags: ["optimistic-update", "tanstack-query", "rollback", "cache", "geojson", "cesium", "ux", "server-state"]
---

# 낙관적 업데이트

## 한 줄 요약

서버 응답을 기다리지 않고 UI를 즉시 반영한 뒤, 실패 시 롤백하는 패턴. 3D 뷰어에서 이슈 데이터를 GeoJSON으로 관리하기 때문에, TanStack Query의 캐시만 롤백하면 Cesium 엔티티도 자동으로 롤백된다. 이 구조 덕분에 3D 환경임에도 낙관적 업데이트와 롤백이 간결하게 구현된다.

## 왜 낙관적 업데이트가 필요했는가

3D 공간에서 사용자가 점을 찍어 이슈를 생성하면, 이 데이터는 서버에 저장되어야 한다. 일반적인 방식은:

```
사용자가 이슈 생성 클릭
  → 서버에 API 요청
  → 서버 응답 대기 (네트워크 지연)
  → 응답 성공 시 UI 반영
```

이 방식의 문제는 **네트워크 지연 동안 사용자가 "아무 일도 안 일어난다"고 느끼는 것**이다. 3D 공간에서 점을 찍었는데 1~2초 동안 아무 반응이 없으면, 사용자는 "클릭이 안 됐나?" 하고 다시 클릭한다. 이중 생성이 발생하거나, UX가 끊기는 느낌을 준다.

**낙관적 업데이트(Optimistic Update)**는 이 문제를 해결한다:

```
사용자가 이슈 생성 클릭
  → UI에 즉시 반영 (서버 응답 전)
  → 동시에 서버에 API 요청
  → 성공 시: 서버 데이터로 UI 동기화
  → 실패 시: UI를 이전 상태로 롤백
```

사용자 입장에서는 클릭 즉시 이슈가 화면에 나타나므로, 반응이 즉각적으로 느껴진다.

## GeoJSON 기반 아키텍처가 롤백을 간결하게 만든다

3D 환경에서 낙관적 업데이트를 구현할 때 가장 우려되는 것은, **Cesium 엔티티(3D 공간에 그려진 점, 선, 라벨)를 어떻게 롤백할 것인가**다. 일반 웹 앱은 리스트에서 항목 하나를 제거하면 되지만, 3D에서는 WebGL Canvas 위에 그려진 엔티티를 직접 관리해야 하기 때문이다.

이 문제가 실무에서 의외로 간단하게 해결된 이유는, **이슈 데이터를 GeoJSON으로 관리**하고 있기 때문이다.

### GeoJSON 기반 데이터 흐름

```
서버에서 이슈 목록 조회 → GeoJSON 형태로 응답
  → TanStack Query 캐시에 저장
  → Cesium이 캐시의 GeoJSON을 읽어 엔티티를 렌더링
```

이 구조에서 Cesium 엔티티는 **TanStack Query 캐시의 파생(derived)**이다. 캐시가 변경되면 Cesium이 자동으로 엔티티를 업데이트하고, 캐시에서 항목이 제거되면 해당 엔티티도 자동으로 사라진다.

따라서 **롤백 시 TanStack Query 캐시만 되돌리면, Cesium 엔티티도 자동으로 롤백**된다. 별도의 "Cesium 엔티티 롤백" 로직이 필요 없다.

이것은 데이터 아키텍처 선택의 결과다. 만약 이슈 데이터를 GeoJSON이 아닌 별도의 Cesium Entity API로 직접 관리했다면, 캐시 롤백과 엔티티 롤백을 따로 처리해야 했을 것이다. GeoJSON 기반으로 "단일 데이터 소스(Single Source of Truth)"를 유지한 것이, 낙관적 업데이트 구현을 크게 단순화시킨 설계 결정이었다.

## TanStack Query의 Mutation 패턴

TanStack Query(구 React Query)는 서버 상태 관리 라이브러리로, 낙관적 업데이트를 위한 체계적인 3단계 패턴을 제공한다.

### onMutate — 요청 직전: 스냅샷 저장 + 낙관적 반영

서버 요청을 보내기 **직전에** 실행된다. 여기서 두 가지를 수행한다:

1. **현재 캐시 스냅샷을 저장** — 실패 시 롤백할 기준점. `queryClient.getQueryData()`로 현재 GeoJSON 캐시를 복사해둔다.
2. **캐시를 낙관적으로 업데이트** — `queryClient.setQueryData()`로 GeoJSON에 새 이슈 Feature를 추가. Cesium이 이 변경을 감지하여 화면에 새 엔티티를 즉시 그린다.

```typescript
onMutate: async (newIssue) => {
  // 진행 중인 쿼리 취소 (낙관적 업데이트와 충돌 방지)
  await queryClient.cancelQueries({ queryKey });

  // 롤백용 GeoJSON 스냅샷 저장
  const previousGeoJSON = queryClient.getQueryData(queryKey);

  // GeoJSON에 새 Feature를 낙관적으로 추가
  queryClient.setQueryData(queryKey, (old) => ({
    ...old,
    features: [...old.features, newIssue],
  }));

  return { previousGeoJSON }; // onError에서 사용할 컨텍스트
}
```

여기서 `cancelQueries`가 중요하다. 낙관적 업데이트와 동시에 기존 데이터를 refetch하는 쿼리가 진행 중이면, refetch 결과가 낙관적 업데이트를 덮어쓸 수 있다. 이를 방지하기 위해 먼저 취소한다.

이 시점에서 사용자는 이미 새 이슈가 3D 공간에 나타나는 것을 본다. 서버에는 아직 요청이 날아가는 중이다.

### onError — 요청 실패 시: GeoJSON 스냅샷으로 롤백

서버 요청이 실패하면 실행된다. onMutate에서 `return`한 컨텍스트(`previousGeoJSON`)를 받아서, **캐시를 원래 GeoJSON으로 되돌린다.**

```typescript
onError: (error, newIssue, context) => {
  // GeoJSON을 이전 상태로 롤백
  queryClient.setQueryData(queryKey, context.previousGeoJSON);
}
```

캐시가 이전 GeoJSON으로 돌아가면, Cesium이 자동으로 새로 추가됐던 엔티티를 제거한다. **캐시 하나만 롤백하면 3D 화면도 함께 롤백된다** — GeoJSON 기반 아키텍처의 강점이다.

사용자는 잠깐 보였던 이슈가 사라지는 것을 보게 되고, 에러 메시지가 표시된다. "잠깐 보였다가 사라지는" 경험이 "아무 반응이 없다가 에러가 뜨는" 경험보다 낫다 — 최소한 "시스템이 내 요청을 인식했다"는 피드백이 있기 때문이다.

### onSettled — 요청 완료 후: 서버와 최종 동기화

성공이든 실패든 요청이 끝나면 실행된다. 여기서 **서버의 최신 GeoJSON을 다시 가져와(invalidate) 캐시를 동기화**한다.

```typescript
onSettled: () => {
  queryClient.invalidateQueries({ queryKey });
}
```

이것이 왜 필요한가? 성공한 경우에도, 낙관적으로 추가한 Feature(클라이언트가 생성한 임시 데이터)와 서버가 실제로 저장한 Feature 사이에 차이가 있을 수 있다. 예를 들어 서버가 생성한 ID, 타임스탬프, 기본값 등은 클라이언트가 미리 알 수 없다. `invalidateQueries`는 서버에서 최신 GeoJSON을 다시 fetch하여 이 차이를 보정한다.

## 이 경험에서 추출한 원칙

1. **데이터 아키텍처가 구현 난이도를 결정한다.** GeoJSON으로 "단일 데이터 소스"를 유지한 덕분에, 캐시 롤백 하나로 3D 엔티티까지 자동 롤백된다. 만약 Cesium Entity API로 직접 관리했다면 캐시와 엔티티를 따로 롤백해야 했을 것이다. 기능 구현의 난이도는 코드 레벨이 아니라 데이터 구조 레벨에서 결정된다.

2. **낙관적 업데이트의 진짜 난이도는 "성공"이 아니라 "실패 복구"에 있다.** 성공 케이스는 쉽다 — 어차피 서버 데이터로 동기화하면 된다. 실패 시 "무엇을, 어떤 순서로 되돌릴 것인가"를 사전에 설계하는 것이 핵심이다.
