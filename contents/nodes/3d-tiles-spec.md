---
slug: "3d-tiles-spec"
title: "3D Tiles: 수천 개 타일을 브라우저에서 렌더링하는 방법"
cluster: "data"
difficulty: "advanced"
prerequisites:
  - "cesium-adoption"
relatedConcepts:
  - slug: "cesium-adoption"
    relationship: "requiredBy"
  - slug: "mesh-bim-pointcloud"
    relationship: "visualizes"
  - slug: "coordinate-transform"
    relationship: "requires"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "targetOf"
  - slug: "lod"
    relationship: "controls"
  - slug: "ktx2-basis-universal"
    relationship: "appliedTo"
childConcepts:
  - "lod"
tags: ["3d-tiles", "ogc", "b3dm", "glb", "pnts", "tileset-json", "geometric-error"]
---

# 3D Tiles: 수천 개 타일을 브라우저에서 렌더링하는 방법

## 한 줄 요약

수천 개의 3D 타일을 브라우저에서 한 번에 로드하면 메모리 사용량이 급증하여 탭이 크래시된다. 3D Tiles는 카메라가 보는 영역의 타일만, 필요한 해상도로 로드하여 이 문제를 해결한다. OGC(Open Geospatial Consortium)가 2019년 공식 커뮤니티 표준으로 채택한 포맷이며, 실제 운영 환경에서 3,561개 타일을 이 방식으로 안정적으로 서비스했다.

## "한 번에 다 올리지 않는다"

드론으로 촬영한 수천 장의 이미지로 만든 Mesh 모델은 수 GB를 넘긴다. 이걸 브라우저에 통째로 올리면 메모리가 한계를 초과한다. fbxloader-memory-leak 노드에서 경험했던 바로 그 문제다.

3D Tiles는 전체 모델을 작은 타일 조각으로 나누고, 카메라에서 가까운 타일은 정밀하게, 먼 타일은 대략적으로 보여준다. 사용자가 카메라를 움직이면 필요한 타일만 새로 로드하고, 안 보이는 타일은 메모리에서 해제한다.

## tileset.json — 3D Tiles의 목차

```json
{
  "asset": { "version": "1.1" },
  "geometricError": 500.0,
  "root": {
    "boundingVolume": { "region": [2.19, 0.61, 2.20, 0.62, 0, 100] },
    "geometricError": 100.0,
    "refine": "REPLACE",
    "content": { "uri": "tile_root.glb" },
    "children": [...]
  }
}
```

핵심 구성 요소:

**boundingVolume**: 타일이 3D 공간에서 차지하는 영역. region(경위도), box(직육면체), sphere(구) 중 하나.

**geometricError**: 이 타일의 기하학적 오차(미터). 값이 클수록 "부정확한 타일". Cesium은 카메라 거리와 화면 해상도를 고려하여 이 오차가 화면에서 몇 픽셀로 보이는지 계산하고, 허용 임계값(기본 16px)을 넘으면 하위 타일을 로드한다. 상세는 lod 노드에서 다룬다.

**refine**: REPLACE(교체) 또는 ADD(추가). Mesh에서는 주로 REPLACE, Point Cloud에서는 ADD.

## 타일 포맷: b3dm, glb, pnts

| 포맷 | 용도 | 3D Tiles 버전 | 실무 사용 사례 |
|------|------|-------------|--------------|
| b3dm | Mesh (래퍼) | 1.0+ | 드론 → 3D Tiles (상용 도구 출력) |
| glb | Mesh (직접) | 1.1+ | IFC → 3D Tiles (자체 파이프라인) |
| pnts | Point Cloud | 1.0+ | LiDAR/포토그래메트리 |

b3dm은 3D Tiles 1.0 시대에 glTF를 타일로 쓰기 위한 래퍼(wrapper)이며, 1.1부터는 glb 직접 사용이 권장되는 추세다. 자체 파이프라인(ifc-3dtiles-pipeline)에서는 glb를 선택했다.

pnts는 Cesium에서 Point Cloud를 시각화하는 유일한 선택지다.

## geometricError 실무 적용

IFC → 3D Tiles 파이프라인에서 LOD를 생성할 때, 각 단계의 geometricError를 단순화 비율에 비례하도록 설정했다. 이 값의 튜닝 결과에 따라 동일 모델의 타일 로드 수와 GPU 메모리 사용량이 크게 달라졌다. 이 개념을 이해한 후 LOD 전략을 직접 설계할 수 있었다.

## 이 경험에서 추출한 원칙

1. **Spec을 "사용"하는 것과 "이해"하는 것은 다르다.** b3dm을 매일 다뤄도 geometricError의 작동 원리를 모를 수 있다. 깊이 있는 이해는 의도적으로 파고들어야 생긴다.

2. **도구의 출력 포맷에 끌려가지 말고, 스펙의 선택지를 먼저 파악하라.** 상용 도구가 b3dm을 뽑아주니까 b3dm을 쓴 것은 동작했지만, glb 직접 사용이 가능했는지 먼저 검토했다면 더 나은 선택을 할 수 있었을 것이다.

3D Tiles를 처음 다룬다면, tileset.json의 geometricError 값을 변경하면서 Cesium 뷰어에서 타일 로드 동작이 어떻게 달라지는지 직접 확인해 보라. 이 값의 의미를 체감하는 것이 가장 빠른 학습법이다.
