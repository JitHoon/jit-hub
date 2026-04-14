---
slug: "ifc-3dtiles-pipeline"
title: "IFC에서 3D Tiles까지: 5단계 자동 변환 파이프라인"
cluster: "pipeline"
difficulty: "expert"
prerequisites:
  - "3d-tiles-spec"
  - "coordinate-transform"
  - "mesh-bim-pointcloud"
relatedConcepts:
  - slug: "3d-tiles-spec"
    relationship: "produces"
  - slug: "coordinate-transform"
    relationship: "applies"
  - slug: "geoid-correction"
    relationship: "applies"
  - slug: "meridian-convergence"
    relationship: "applies"
  - slug: "spatial-partitioning"
    relationship: "uses"
  - slug: "lod"
    relationship: "uses"
  - slug: "draco-compression"
    relationship: "uses"
childConcepts: []
tags: ["ifc", "3d-tiles", "pipeline", "automation", "claude-code", "bim", "conversion"]
---

# IFC에서 3D Tiles까지: 5단계 자동 변환 파이프라인

## 한 줄 요약

건설 BIM 데이터(IFC)를 웹에서 Cesium으로 시각화할 수 있는 3D Tiles로 자동 변환하는 파이프라인. IFC 요소 추출 → 공간 분할 → LOD 생성 → 좌표 정합 → 지오메트리 압축의 5단계를 거치며, 원본 IFC 39.4MB가 하이브리드 HLOD 적용 후 700KB(95%+ 감소)까지 줄어든다. 모델 구축 시간은 20~30분 이상에서 0~15분 이내로 65%+ 단축됐다.

## 왜 이 파이프라인이 필요했는가

cesium-adoption 노드에서 다뤘듯, 3D Tiles 변환 경로는 두 가지다:

- **드론 이미지 → 3D Tiles**: 상용 포토그래메트리 도구로 처리
- **IFC → 3D Tiles**: **자체 파이프라인 구축**

IFC(Industry Foundation Classes)는 건축·토목 설계 데이터의 국제 표준 포맷이다. 이 안에는 건물의 벽, 기둥, 슬래브, 파이프 등 개별 요소의 기하학 정보와 속성 정보가 모두 들어있다. 이 데이터를 Cesium에서 효율적으로 렌더링하려면, 단순히 포맷만 변환하는 것이 아니라 **웹 렌더링 성능을 위한 최적화**를 변환 과정에 포함시켜야 한다.

## 5단계 파이프라인

### 1단계: IFC 요소 추출

IFC 파일에서 개별 건축 요소(벽, 기둥, 슬래브 등)의 기하학 데이터와 메타데이터를 추출한다.

### 2단계: 공간 분할 (Tiling)

추출된 요소들을 3D 공간에서 적절한 크기의 타일로 분할한다. 원리는 spatial-partitioning 노드에서 다룬다.

### 3단계: LOD 생성

각 타일에 대해 여러 단계의 정밀도를 생성한다. 정점 수를 원본의 2~15%로 단순화하면서 시각적 품질을 유지한다. 원리는 lod 노드에서 다룬다.

### 4단계: 좌표 정합

IFC의 로컬 좌표계를 Cesium의 ECEF 좌표계로 변환한다. 좌표계 변환(coordinate-transform), 지오이드고 보정(geoid-correction), 자오선 수차 보정(meridian-convergence)이 모두 적용된다. tileset.json에 Region Bounding Volume과 geometricError를 정확히 기록한다.

### 5단계: 지오메트리 압축

glb 타일에 Draco 압축을 적용한다. 원리는 draco-compression 노드에서 다룬다.

## 단계별 처리 시간

| 단계 | 도구 | 처리 시간 | 데이터 규모 |
|------|------|-----------|------------|
| .obj → .glb | obj2gltf | 약 1초 | 360KB |
| .glb → .b3dm | 3d-tiles-tools | 약 1초 | - |
| .las → .xyz | PDAL | 약 20초 | 1.22GB |
| .xyz → .pnts | py3dtiles | 약 25초 | 1.22GB |

가장 시간이 오래 걸리는 단계는 Point Cloud 변환(.las → .xyz → .pnts)으로, 약 45초가 소요된다. 이는 1.22GB 크기의 LiDAR 데이터를 처리해야 하기 때문이다. Mesh 변환(.obj → .glb → .b3dm)은 수 초 이내로 빠르다.

이 파이프라인에서 사용하는 도구들(obj2gltf, 3d-tiles-tools, py3dtiles)은 모두 CesiumGS와 glTF 생태계의 오픈소스 프로젝트다.

## 하이브리드 HLOD: 가장 인상적인 결과

파이프라인의 하이라이트는 **하이브리드 HLOD(Hierarchical Level of Detail)** 변환이다:

| 단계 | 파일 크기 |
|------|----------|
| 원본 IFC | 39.4MB |
| 기존 방식 (b3dm + json) | 11.9MB |
| **하이브리드 HLOD (glb + json)** | **700KB** |

95% 이상의 파일 크기 감소다. HLOD는 건물 전체를 하나의 저해상도 glb로 표현하는 최상위 LOD와, 층별·영역별 고해상도 타일을 조합하는 방식이다. 카메라가 멀면 700KB 하나만 로드하고, 가까워지면 필요한 영역의 상세 타일만 추가 로드한다.

## 최종 결과

| 지표 | 변환 전 | 변환 후 |
|------|--------|--------|
| 파일 크기 | 원본 IFC 대비 | **75~95% 감소** |
| 모델 구축 시간 | 20~30분 이상 | **0~15분 이내** (65%+ 단축) |
| 웹 렌더링 | 불가능 (IFC 직접 로드 불가) | **안정적 렌더링** |

## Claude Code를 활용한 설계·구현

이 파이프라인은 Claude Code의 plan 모드에서 전체 아키텍처를 먼저 설계하고, 각 단계의 입력/출력을 명확히 정의한 뒤 서브 에이전트에게 병렬적으로 구현을 위임했다. 각 단계에 대해 실제 IFC 파일을 입력으로 넣어 자동 테스트하고 결과를 보고서로 작성하는 사이클을 반복했다.

## 이 경험에서 추출한 원칙

1. **포맷 변환은 "파일 형식 바꾸기"가 아니라 "웹 렌더링 최적화"다.** IFC → glb 변환만으로는 충분하지 않다. 공간 분할, LOD, 압축까지 포함해야 웹에서 실용적으로 사용할 수 있다.

2. **입력/출력을 명확히 정의하면 복잡한 시스템도 분해할 수 있다.** 각 단계의 인터페이스가 명확하면 독립 구현·테스트가 가능하다.

IFC 파일을 웹에서 시각화해야 한다면, 직접 로드를 시도하기 전에 3D Tiles 변환 파이프라인부터 설계하라. 변환 없이 대용량 IFC를 브라우저에 직접 올리는 것은 성립하지 않는다.
