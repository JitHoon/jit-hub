---
slug: "optimistic-update"
title: "3D 뷰어에서 서버 응답을 기다리지 않고 UI를 즉시 반영하기"
cluster: "feature"
difficulty: "advanced"
prerequisites:
  - "cesium-mouse-events"
relatedConcepts:
  - slug: "cesium-mouse-events"
    relationship: "builtOn"
childConcepts: []
tags: ["optimistic-update", "tanstack-query", "rollback", "cache", "geojson", "cesium", "ux", "server-state"]
---

# 3D 뷰어에서 서버 응답을 기다리지 않고 UI를 즉시 반영하기

## 한 줄 요약

3D 공간에서 이슈를 생성하면 서버 응답 대기 200ms~2초 동안 UI 반응이 없었다. 낙관적 업데이트를 적용하여 클릭 즉시(0ms) 3D 엔티티를 화면에 반영하고, 실패 시 GeoJSON 캐시 롤백 1줄로 Cesium 엔티티까지 자동 롤백했다. 3D 환경이라 롤백이 어려울 것으로 예상했으나, GeoJSON 아키텍처 덕분에 의외로 간결했다.

## 클릭했는데 아무 일도 안 일어난다

3D 공간에서 사용자가 점을 찍어 이슈를 생성하면, 서버에 저장해야 한다. 기존 방식에서는 네트워크 지연(200ms~2초) 동안 아무 반응이 없었다. 사용자는 "클릭이 안 됐나?" 하고 다시 클릭한다. 이중 생성이 발생했다.

**낙관적 업데이트**로 해결했다. 서버 응답 전에 UI를 즉시 반영하고, 실패 시 롤백한다.

## 3D 환경에서 롤백이 간결한 이유: GeoJSON 아키텍처

3D 환경에서 가장 우려되는 것은 **Cesium 엔티티(3D 공간에 그려진 점, 선, 라벨)를 어떻게 롤백할 것인가**다.

이 문제가 의외로 간단하게 해결된 이유는, **이슈 데이터를 GeoJSON으로 관리**하고 있기 때문이다:

```
서버 → GeoJSON 응답 → TanStack Query 캐시 → Cesium이 캐시를 읽어 엔티티 렌더링
```

Cesium 엔티티는 **TanStack Query 캐시의 파생(derived)**이다. 캐시가 변경되면 엔티티가 업데이트되고, 캐시에서 항목이 제거되면 엔티티도 사라진다. 따라서 **롤백 시 캐시만 되돌리면 엔티티도 자동 롤백**된다.

만약 GeoJSON이 아닌 Cesium Entity API로 직접 관리했다면, 캐시 롤백과 엔티티 롤백을 따로 처리해야 했을 것이다.

## TanStack Query의 Mutation 패턴

### onMutate — 스냅샷 저장 + 낙관적 반영

```typescript
onMutate: async (newIssue) => {
  await queryClient.cancelQueries({ queryKey });
  const previousGeoJSON = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, (old) => ({
    ...old,
    features: [...old.features, newIssue],
  }));
  return { previousGeoJSON };
}
```

이 시점에서 사용자는 이미 새 이슈가 3D 공간에 나타나는 것을 본다.

### onError — GeoJSON 스냅샷으로 롤백

```typescript
onError: (error, newIssue, context) => {
  queryClient.setQueryData(queryKey, context.previousGeoJSON);
}
```

캐시 하나만 롤백하면 3D 화면도 함께 롤백된다.

### onSettled — 서버와 최종 동기화

```typescript
onSettled: () => {
  queryClient.invalidateQueries({ queryKey });
}
```

## 적용 결과

| 지표 | 적용 전 | 적용 후 |
|------|--------|--------|
| 체감 응답 시간 | 200ms~2초 | **즉시(0ms)** |
| 이중 클릭 에러 | 재클릭으로 이중 생성 발생 | **즉시 반영으로 재클릭 동기 제거** |
| 롤백 구현 복잡도 | (예상) 3D 엔티티 직접 관리 필요 | **캐시 교체 1줄** |

## 이 경험에서 추출한 원칙

1. **데이터 아키텍처가 구현 난이도를 결정한다.** GeoJSON "단일 데이터 소스"를 유지한 덕분에, 캐시 롤백 하나로 3D 엔티티까지 자동 롤백된다. 기능의 난이도는 코드 레벨이 아니라 데이터 구조 레벨에서 결정된다.

2. **낙관적 업데이트의 진짜 난이도는 "성공"이 아니라 "실패 복구"에 있다.** "무엇을, 어떤 순서로 되돌릴 것인가"를 사전에 설계하는 것이 핵심이다.

TanStack Query의 onMutate/onError/onSettled 패턴은 3D 환경이 아니더라도 모든 서버 상태 관리에 적용 가능하다. 사용자가 "느리다"고 느끼는 인터랙션이 있다면, 낙관적 업데이트 적용을 검토해 보라.
