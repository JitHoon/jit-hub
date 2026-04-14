---
slug: "mesh-bim-pointcloud"
title: "3D 데이터 유형 3가지: 각각 무엇이 가능하고 불가능한가"
cluster: "data"
difficulty: "beginner"
prerequisites: []
relatedConcepts:
  - slug: "cesium-adoption"
    relationship: "enabledBy"
  - slug: "3d-tiles-spec"
    relationship: "visualizedBy"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "inputTo"
  - slug: "measurement-tools"
    relationship: "usedBy"
childConcepts: []
tags: ["mesh", "bim", "point-cloud", "ifc", "las", "3d-model", "photogrammetry"]
---

# 3D 데이터 유형 3가지: 각각 무엇이 가능하고 불가능한가

## 한 줄 요약

같은 건설 현장을 Mesh, BIM, Point Cloud 세 가지로 촬영/모델링하면, 각각 전혀 다른 것을 볼 수 있고 전혀 다른 한계를 갖는다. 단면도가 필요하면 Point Cloud를 써야 하고, 속성 정보가 필요하면 BIM을 써야 한다. 이 기하학적 본질을 이해하지 못하면 기능 구현 시 불가능한 것을 시도하게 된다.

## Mesh — 겉은 보이지만 속이 비어있다

Mesh는 삼각형 면(폴리곤)으로 이루어진 **표면(surface)**이다. 드론 촬영 이미지를 포토그래메트리로 합성하여 생성한다. 텍스처가 입혀져 시각적 현실감이 높다.

결정적 제약: **속이 비어있다.** Clipping Plane으로 자르면, 잘린 단면이 **실처럼 얇은 선**으로 나타난다. 단면도(Profile) 분석이 불가능하다.

**3D Tiles 포맷**: glTF/glb 또는 b3dm. **용량 참고**: .fbx → .glb 변환 시 33% 용량 감소 (편집 히스토리·메타데이터 제거).

## Point Cloud — 점이지만 속이 차있다

Point Cloud는 3차원 공간에 분포하는 점들의 집합이다. LiDAR 스캐너 또는 포토그래메트리로 생성한다. 점과 점 사이에 빈 공간이 있어 현실감은 떨어진다.

결정적 장점: **표면뿐 아니라 내부에도 점 데이터가 존재한다.** Clipping Plane으로 자르면 의미 있는 단면 데이터가 나타난다. 이것이 단면도 분석에 Point Cloud가 필수적인 이유다.

**3D Tiles 포맷**: pnts. Cesium에서 유일한 선택지.

## BIM — "무엇인지"를 기록한다

BIM(Building Information Modeling)은 건축 구조물의 설계 정보를 담은 데이터 모델이다. IFC 포맷이 국제 표준. 기하학 정보뿐 아니라 **이름, 재질, 용도, 층 정보** 같은 속성 정보까지 포함한다.

Mesh에서는 "직육면체 형상이 있다"까지만 알 수 있지만, BIM에서는 "2층의 내력벽, 콘크리트, 두께 300mm"까지 알 수 있다.

**좌표 특성**: 정표고를 사용하므로 Cesium 배치 시 geoid-correction 노드의 지오이드고 보정이 필요하다.

## 기하학적 비교

| 항목 | Mesh | Point Cloud | BIM |
|------|------|-------------|-----|
| 내부 데이터 | 없음 (속이 빈 껍질) | 있음 (내부에도 점) | 있음 (설계 기반) |
| 시각적 현실감 | 높음 (텍스처) | 낮음 (빈 공간) | 중간 (설계 형상) |
| 속성 정보 | 없음 | 색상, 강도 등 | 이름, 재질, 용도 등 |
| 단면도 가능 | **불가** (실처럼 나옴) | **가능** (Clipping Plane) | 변환 후 가능 |
| 3D Tiles 포맷 | b3dm 또는 glb | pnts | glb 또는 b3dm |

## 실무 선택 기준

- **고객이 단면도를 요구하면** → Point Cloud (Mesh로는 불가능)
- **외관 검수만 필요하면** → Mesh (시각적 현실감 최고)
- **층별 속성 조회가 필요하면** → BIM (설계 정보 포함)
- **동일 현장에서 복합 분석이 필요하면** → Mesh + Point Cloud + BIM 공존

## 이 경험에서 추출한 원칙

1. **데이터 유형의 선택은 기능 요구사항이 결정한다.** "어떤 모델이 더 좋은가"가 아니라 "어떤 기능을 구현해야 하는가"에 따라 필요한 유형이 정해진다.

2. **기하학적 특성이 기능의 가능 여부를 결정한다.** Mesh가 단면도에 쓸 수 없는 이유는 성능이 아니라, "속이 빈 표면"이라는 기하학적 본질 때문이다.

3D 프로젝트를 시작할 때, 어떤 데이터 유형을 사용할지 결정하기 전에 "이 데이터로 어떤 분석 기능이 필요한가?"를 먼저 정의하라.
