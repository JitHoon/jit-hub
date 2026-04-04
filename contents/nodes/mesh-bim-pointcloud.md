---
slug: "mesh-bim-pointcloud"
title: "Mesh·BIM·Point Cloud"
cluster: "graphics"
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

# Mesh·BIM·Point Cloud

## 한 줄 요약

3D GIS에서 다루는 세 가지 기본 데이터 유형. 각각의 기하학적 특성이 다르기 때문에, 시각화·분석·설계 정보 확인 등 용도에 따라 적합한 유형이 달라진다.

## Mesh — 표면으로 구성된 3D 모델

Mesh는 세 개의 점(정점, vertex)을 연결하여 삼각형 면(폴리곤)을 만들고, 그 면 위에 텍스처(이미지)를 입힌 3D 모델이다. 드론 촬영 이미지를 포토그래메트리 기술로 합성하거나, 3D 모델링 소프트웨어로 직접 생성한다.

**핵심 특성**: Mesh는 삼각형 면들로 이루어진 **표면(surface)**이다. 겉은 보이지만 **속이 비어있다.** 이것은 시각적으로는 문제가 되지 않지만, 분석 기능에서는 결정적인 제약이 된다.

예를 들어 Clipping Plane(절단면)으로 Mesh를 자르면, 잘린 단면이 **실처럼 얇은 선**으로 나타난다. 속이 빈 표면만 존재하기 때문이다. 지반 단면이나 구조물 내부를 확인하는 단면도(Profile) 용도로는 사용이 불가능하다.

**3D Tiles에서의 포맷**: glTF/glb 또는 b3dm으로 타일링된다.

## Point Cloud — 점들의 3차원 집합

Point Cloud는 3차원 공간에 분포하는 점들의 집합이다. 각 점은 위치(x, y, z)와 색상(RGB)을 가지며, 선택적으로 법선 벡터, 반사 강도(intensity) 등의 속성을 포함한다. LiDAR 스캐너 또는 포토그래메트리 소프트웨어로 생성되며, LAS/LAZ 포맷으로 저장된다.

**핵심 특성**: 점과 점 사이에 빈 공간이 있어 Mesh에 비해 현실감이 떨어진다. 그러나 Mesh와 결정적으로 다른 점이 있다 — **표면뿐 아니라 내부에도 점 데이터가 존재한다.**

이 특성 때문에 Clipping Plane으로 자르면, 잘린 면에 **의미 있는 단면 데이터가 나타난다.** 색상 정보까지 포함되어 있어 지반의 층 구조나 구조물의 내부 상태를 시각적으로 확인할 수 있다. 이것이 단면도(Profile) 분석에 Point Cloud가 필수적인 이유다.

**3D Tiles에서의 포맷**: pnts 포맷으로 타일링된다. Cesium에서 Point Cloud를 시각화하려면 pnts가 유일한 선택지다.

**메모리 특성**: 점 하나마다 위치(12바이트) + 색상(3바이트) 이상의 데이터를 가지므로, 수백만~수천만 개의 점으로 구성된 대규모 Point Cloud는 웹 환경에서 메모리 관리가 가장 까다로운 유형이다.

## BIM — 건물의 설계 정보를 담은 모델

BIM(Building Information Modeling)은 건축·토목 구조물의 설계 정보를 담은 데이터 모델이다. IFC(Industry Foundation Classes) 포맷이 국제 표준이며, 기하학 정보(형상)뿐 아니라 **구조물의 이름, 재질, 용도, 층 정보** 같은 속성(semantic) 정보까지 포함한다.

**핵심 특성**: Mesh나 Point Cloud가 "보이는 것"을 기록하는 반면, BIM은 **"무엇인지"**를 기록한다. 예를 들어 Mesh에서는 "여기에 직육면체 형상이 있다"까지만 알 수 있지만, BIM에서는 "이것은 2층의 내력벽이고, 재질은 콘크리트이며, 두께는 300mm다"까지 알 수 있다.

**좌표 특성**: BIM 데이터는 일반적으로 정표고(orthometric height)를 사용한다. Cesium 같은 글로벌 3D 지구본은 타원체고(ellipsoidal height)를 사용하므로, BIM을 지구본 위에 배치할 때 지오이드고 보정이 필요하다. 이 내용은 "지오이드고 보정" 노드에서 다룬다.

**3D Tiles에서의 포맷**: IFC에서 glb 또는 b3dm으로 변환하여 타일링한다. 이 변환은 포토그래메트리와 달리 자체 파이프라인 구축이 가능한 규모의 작업이다.

## 세 유형의 기하학적 비교

| 항목 | Mesh | Point Cloud | BIM |
|------|------|-------------|-----|
| 기하학 구조 | 삼각형 면(표면) | 개별 점(체적 포함) | 솔리드/표면 혼합 |
| 내부 데이터 | 없음 (속이 빈 껍질) | 있음 (내부에도 점 존재) | 있음 (설계 기반) |
| 시각적 현실감 | 높음 (텍스처) | 낮음 (점 사이 빈 공간) | 중간 (설계 형상) |
| 속성 정보 | 없음 | 색상, 강도 등 | 이름, 재질, 용도 등 |
| 단면도 가능 여부 | 불가 (실처럼 나옴) | 가능 (Clipping Plane) | 변환 후 가능 |
| 대표 파일 포맷 | glTF/glb | LAS/LAZ | IFC |
| 3D Tiles 포맷 | b3dm 또는 glb | pnts | glb 또는 b3dm |

## Clipping Plane 단면도: Mesh vs Point Cloud

이 차이는 단순한 스펙 비교가 아니라, 실제 기능 구현의 가능 여부를 결정하는 핵심이다.

**Mesh를 자르면**: 삼각형 면들이 절단면과 만나는 **교선(intersection line)**만 남는다. 속이 없으므로 단면에 면적이 없다. 옆에서 보면 얇은 선 하나만 보인다.

**Point Cloud를 자르면**: 절단면 부근에 존재하는 **모든 점**이 남는다. 점의 밀도에 따라 단면의 형상이 드러나고, 각 점의 색상 정보로 재질이나 층 구조를 시각적으로 확인할 수 있다.

이 기하학적 본질 때문에, 단면도 분석이 필요한 한 Point Cloud를 완전히 대체하는 것은 어렵다.

## 이 경험에서 추출한 원칙

1. **데이터 유형의 선택은 기능 요구사항이 결정한다.** "어떤 모델이 더 좋은가"가 아니라 "어떤 기능을 구현해야 하는가"에 따라 필요한 데이터 유형이 정해진다. 단면도가 필요하면 Point Cloud를 쓸 수밖에 없다.

2. **기하학적 특성이 기능의 가능 여부를 결정한다.** Mesh가 단면도에 쓸 수 없는 이유는 성능이나 품질 때문이 아니라, "속이 빈 표면"이라는 기하학적 본질 때문이다. 이런 본질적 제약을 이해해야 올바른 기술 선택을 할 수 있다.
