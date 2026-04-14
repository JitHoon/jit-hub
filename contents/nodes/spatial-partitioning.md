---
slug: "spatial-partitioning"
title: "카메라에 안 보이는 타일은 로드하지 않는다: Quadtree와 AABB"
cluster: "performance"
difficulty: "advanced"
prerequisites:
  - "3d-tiles-spec"
relatedConcepts:
  - slug: "ifc-3dtiles-pipeline"
    relationship: "usedIn"
  - slug: "lod"
    relationship: "complementary"
  - slug: "mesh-bim-pointcloud"
    relationship: "appliedTo"
childConcepts: []
tags: ["quadtree", "aabb", "spatial-partitioning", "tiling", "bounding-volume", "3d-tiles"]
---

# 카메라에 안 보이는 타일은 로드하지 않는다: Quadtree와 AABB

## 한 줄 요약

3,561개 타일을 공간 분할 없이 전부 로드하면 브라우저가 크래시된다. Quadtree로 공간을 분할하고 AABB로 시야 판정을 하면, 카메라가 보는 방향의 타일만 선택적으로 로드된다. 한 시점에서 렌더링 대상이 전체 타일의 일부로 줄어든다.

## 3,561개 타일을 한 번에 로드하면

수천 개의 건축 요소를 하나의 파일로 웹에 올리면, 카메라에 보이지 않는 부분까지 GPU에 올라가면서 메모리가 낭비된다. 로딩 시간도 파일 크기에 비례하여 길어진다.

공간 분할은 **"전체를 한 번에 올리지 말고, 보이는 부분만 올리자"**로 해결한다.

## Quadtree — 2차원 공간의 재귀적 4분할

Quadtree는 2차원 평면을 재귀적으로 4등분하는 트리 구조다. 데이터가 밀집된 영역은 세밀하게 분할되고, 데이터가 적은 영역은 큰 단위로 남는다.

이 프로젝트에서 Quadtree(2D)를 Octree(3D) 대신 선택한 이유: 건설 현장의 BIM 모델은 수평 방향으로 넓게 퍼져 있고, 수직 방향(높이)의 복잡성은 상대적으로 낮다. 고층 빌딩처럼 수직으로 복잡한 구조라면 Octree가 더 적합하지만, 대부분의 건설 현장은 2D 분할로 충분했다.

## AABB — 타일의 공간 범위 정의

AABB(Axis-Aligned Bounding Box)는 3D 객체를 감싸는 축 정렬 최소 직육면체다. 6개의 숫자(min/max x, y, z)로 표현된다.

3D Tiles의 `boundingVolume.box`가 정확히 AABB다. Cesium은 매 프레임마다 "이 타일의 AABB가 카메라의 frustum(시야 절두체)과 겹치는가?"를 검사한다. AABB는 6개 숫자의 비교 연산만으로 겹침 판정이 가능하다. 겹치지 않는 타일은 아예 로드하지 않는다.

## frustum culling의 실제 효과

카메라를 한 방향으로 고정하면, 시야 밖의 타일은 로드되지 않는다. 3,561개 타일 기준으로, 한 시점에서 실제 렌더링 대상은 카메라 방향과 줌 레벨에 따라 전체의 일부만 로드된다. 나머지는 AABB 기반 frustum culling에 의해 로드 자체가 건너뛰어진다.

## Quadtree와 AABB의 관계

두 기법은 **서로 다른 레벨에서 작동하는 상호 보완 관계**다:

- **Quadtree**: 전체 공간을 어떻게 분할할 것인가 (공간 분할 전략)
- **AABB**: 개별 객체/타일이 어떤 공간을 차지하는가 (범위 정의)

Quadtree로 건물 전체를 영역으로 분할한 뒤, 각 요소의 AABB를 계산하여 "이 벽은 3번 영역에 속한다"를 결정한다. 분할 결과가 tileset.json의 계층적 타일 구조로 표현되고, 각 타일의 boundingVolume이 AABB로 정의된다 (Cesium 공식 문서의 Implicit Tiling 참고).

## 이 경험에서 추출한 원칙

1. **"전부 보여주기"는 웹 3D에서 불가능하다.** 대용량 3D 데이터를 웹에서 다루려면, "보이지 않는 것은 로드하지 않는다"가 출발점이다.

2. **단순한 데이터 구조가 복잡한 최적화를 가능하게 한다.** AABB는 숫자 6개에 불과하지만, 이 6개의 숫자만으로 "이 타일이 카메라 시야에 보이는가?"를 매 프레임 빠르게 판단할 수 있다.

3D 뷰어에서 모든 타일이 항상 로드되고 있다면, frustum culling이 적용되어 있는지 확인하라. 적용되지 않았다면 가장 쉽고 효과가 큰 최적화 대상이다.
