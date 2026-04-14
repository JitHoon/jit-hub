---
slug: "lod"
title: "카메라가 멀면 정점을 2%만 렌더링한다: LOD 전략"
cluster: "performance"
difficulty: "advanced"
prerequisites:
  - "3d-tiles-spec"
relatedConcepts:
  - slug: "3d-tiles-spec"
    relationship: "controlledBy"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "usedIn"
  - slug: "spatial-partitioning"
    relationship: "complementary"
childConcepts: []
tags: ["lod", "level-of-detail", "mesh-simplification", "geometric-error", "3d-tiles", "optimization"]
---

# 카메라가 멀면 정점을 2%만 렌더링한다: LOD 전략

## 한 줄 요약

카메라가 건물에서 1km 떨어져 있는데 배관 디테일(10,000개 정점)을 렌더링할 필요가 있는가? LOD는 카메라 거리에 따라 정점을 원본의 2~15%만 사용한다. QEM 알고리즘(Garland & Heckbert, SIGGRAPH 1997)으로 시각적으로 중요한 모서리를 보존하면서 98%를 제거해도 실루엣이 유지된다.

## 10,000개 중 9,990개는 의미가 없다

10,000개의 정점으로 이루어진 기둥 모델을 생각해보자. 카메라가 1미터 거리에 있으면 10,000개 정점이 모두 의미가 있다. 기둥의 모서리, 곡면, 디테일이 화면에 크게 보이기 때문이다.

카메라가 1km 거리에 있으면? 이 기둥은 화면에서 겨우 몇 픽셀이다. 10,000개의 정점 중 9,990개는 화면에 아무런 차이를 만들지 않는다. 그러나 GPU는 여전히 10,000개를 모두 처리한다.

LOD는 같은 기둥에 대해 여러 버전을 준비한다:

- **LOD 0 (원본)**: 10,000개 정점 — 가까이서 볼 때
- **LOD 1**: 1,500개 정점 (15%) — 중간 거리
- **LOD 2**: 500개 정점 (5%) — 먼 거리
- **LOD 3**: 200개 정점 (2%) — 매우 먼 거리

## 메쉬 단순화: QEM 알고리즘

LOD 각 단계를 생성하는 핵심 기술이 메쉬 단순화다. 가장 널리 사용되는 방법은 **엣지 축소(Edge Collapse)** — 엣지의 두 정점을 하나로 합치는 것이다.

핵심은 **어떤 엣지를 먼저 합칠 것인가**다. **QEM(Quadric Error Metrics)** 알고리즘(Garland & Heckbert, "Surface Simplification Using Quadric Error Metrics", SIGGRAPH 1997)은 각 엣지를 합쳤을 때 발생하는 기하학적 오차를 수학적으로 계산하고, 오차가 가장 작은 엣지부터 순서대로 합친다.

이 알고리즘은 메쉬 단순화의 업계 표준으로, glTF 생태계의 meshoptimizer와 gltf-transform에서도 채택하고 있다.

### 98% 제거해도 괜찮은 이유

QEM은 평평한 면의 정점을 먼저 제거하고, 건물의 윤곽선이나 모서리 같은 시각적으로 중요한 정점은 마지막까지 남긴다. 98%를 제거해도 "건물의 실루엣"은 유지된다. 그리고 정점 2%의 LOD는 카메라가 수백 미터~수 km 떨어져 있을 때만 사용되므로, 이 거리에서 10,000개든 200개든 시각적 차이가 없다.

## geometricError: 언제 LOD를 전환하는가

3d-tiles-spec 노드에서 다뤘듯, **geometricError**는 각 타일이 원본 대비 얼마나 부정확한지를 미터 단위로 나타낸다.

```
root (geometricError: 500)        ← LOD 3 (2%)
└── children (geometricError: 100) ← LOD 2 (5%)
    └── children (geometricError: 10) ← LOD 1 (15%)
        └── children (geometricError: 0) ← LOD 0 (원본)
```

Cesium은 매 프레임 "이 타일의 geometricError가 화면에서 몇 픽셀로 보이는가"를 계산하여, 허용 임계값(기본 16픽셀)을 초과하면 더 정밀한 하위 타일을 로드한다.

### geometricError 튜닝

geometricError 값을 결정하는 것은 **단순화 비율에 비례하도록 설정**하는 것이 출발점이다. 정점을 50%로 줄인 LOD의 geometricError는 2%로 줄인 LOD보다 작아야 한다.

그러나 정확한 값은 모델의 크기, 디테일 수준, 사용 목적에 따라 달라지는 **튜닝 작업**이다. 실무에서는 Cesium 뷰어에서 카메라를 다양한 거리로 이동하며 LOD 전환 시점의 시각적 품질을 확인하고, geometricError를 조정하는 반복 테스트를 수행했다.

## LOD와 공간 분할의 관계

| 기법 | 최적화 방향 | 역할 |
|------|-----------|------|
| 공간 분할 (Quadtree/AABB) | 수평 | 보이지 않는 타일은 로드하지 않는다 |
| LOD | 깊이 | 먼 타일은 간략하게 보여준다 |

두 기법이 함께 적용되면, 시야 밖의 타일은 아예 로드하지 않고 시야 안의 먼 타일은 낮은 LOD로 로드한다. 이것이 3D Tiles가 수 GB의 데이터를 웹 브라우저에서 렌더링할 수 있는 핵심 메커니즘이다.

## 이 경험에서 추출한 원칙

1. **"보이는 만큼만 처리한다"가 웹 3D 최적화의 핵심이다.** LOD는 "보이는 크기에 맞는 정밀도만 제공한다"이고, 공간 분할은 "보이는 영역만 로드한다"이다.

2. **단순화의 품질은 "얼마나 줄이느냐"보다 "무엇을 보존하느냐"에 달려있다.** 알고리즘이 어떤 우선순위로 정점을 제거하는지가 품질을 결정한다.

3D 모델이 웹에서 느리다면, 먼저 LOD가 적용되어 있는지 확인하라. 모든 거리에서 원본 해상도를 로드하고 있다면 가장 큰 최적화 기회를 놓치고 있는 것이다.
