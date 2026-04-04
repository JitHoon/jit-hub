---
slug: "ifc-3dtiles-pipeline"
title: "IFC→3D Tiles 자동 변환 파이프라인"
cluster: "implementation"
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

# IFC→3D Tiles 자동 변환 파이프라인

## 한 줄 요약

건설 BIM 데이터(IFC)를 웹에서 Cesium으로 시각화할 수 있는 3D Tiles로 자동 변환하는 파이프라인. IFC 요소 추출, 공간 분할, LOD 생성, 좌표 정합, 지오메트리 압축의 과정을 거치며, Claude Code의 plan 모드와 서브 에이전트를 활용하여 설계·구현했다.

## 왜 이 파이프라인이 필요했는가

Cesium.js 도입 결정 노드에서 다뤘듯, 3D Tiles 변환 경로는 두 가지다:

- **드론 이미지 → 3D Tiles**: 상용 포토그래메트리 도구로 처리 (혼자 구축 불가능한 규모)
- **IFC → 3D Tiles**: 자체 파이프라인 구축 가능한 규모

IFC(Industry Foundation Classes)는 건축·토목 설계 데이터의 국제 표준 포맷이다. 이 안에는 건물의 벽, 기둥, 슬래브, 파이프 등 **개별 요소의 기하학 정보와 속성 정보**가 모두 들어있다. 이 데이터를 Cesium에서 효율적으로 렌더링하려면, 웹에 최적화된 3D Tiles 포맷으로 변환해야 한다.

공개된 IFC → 3D Tiles 변환 방법론은 여러 가지가 존재한다. obj → 3D Tiles, glTF → 3D Tiles 같은 중간 단계를 거치는 방식도 있고, IFC에서 직접 3D Tiles를 생성하는 방식도 있다. 핵심은 단순히 포맷을 변환하는 것이 아니라, **웹 렌더링 성능을 위한 최적화**(공간 분할, LOD, 압축)를 변환 과정에 포함시키는 것이다.

## 파이프라인이 수행하는 것

구체적인 구현 순서와 사용 라이브러리는 공개할 수 없지만, 이 파이프라인이 해결하는 문제들을 기술적으로 설명한다.

### IFC 요소 추출

IFC 파일에서 개별 건축 요소(벽, 기둥, 슬래브 등)의 **기하학 데이터(정점, 면)와 메타데이터(이름, 유형, 속성)**를 추출한다. IFC는 STEP 기반의 복잡한 데이터 구조를 가지고 있어, 파싱 자체가 하나의 도전이다.

### 공간 분할 (Tiling)

추출된 요소들을 **3D 공간에서 적절한 크기의 타일로 분할**한다. 타일링이 없으면 건물 전체가 하나의 거대한 파일이 되어 웹에서 로드할 수 없다. 공간 분할 기법의 원리는 "공간 분할 기법 — Quadtree와 AABB" 노드에서 다룬다.

### LOD 생성

각 타일에 대해 **여러 단계의 정밀도(Level of Detail)**를 생성한다. 카메라가 멀 때는 간략한 버전을, 가까울 때는 정밀한 버전을 보여주기 위함이다. 정점 수를 원본의 2~15% 수준으로 단순화하면서 시각적 품질을 유지한다. 자세한 원리는 "LOD 레벨 오브 디테일" 노드에서 다룬다.

### 좌표 정합

IFC의 로컬 좌표계를 Cesium이 사용하는 ECEF 좌표계로 변환한다. 이 과정에서 좌표계 변환(EPSG→WGS84→ECEF), 지오이드고 보정(정표고→타원체고), 자오선 수차 보정(Grid North→True North)이 모두 적용된다. 각각의 상세 원리는 해당 노드에서 다룬다.

최종적으로 tileset.json에 Region Bounding Volume과 geometricError를 정확히 기록하여, Cesium이 각 타일의 공간 범위와 정밀도를 올바르게 인식하도록 한다.

### 지오메트리 압축

생성된 glb 타일에 Draco 압축을 적용하여 파일 크기를 줄인다. 이를 통해 네트워크 전송 시간과 메모리 사용량을 절감한다. Draco 압축의 원리는 해당 노드에서 다룬다.

### 최종 산출물

파이프라인의 최종 출력은 **tileset.json + 다수의 glb 타일 파일**이다. 파이프라인 적용 결과, 원본 IFC 대비 파일 크기가 **75~95% 감소**했다. 또한 대용량임에도 웹 상에서 안전하게 렌더링된다.

## Claude Code를 활용한 설계·구현

이 파이프라인은 **Claude Code를 적극 활용하여 설계하고 구현**했다. 단순히 코드를 생성하는 수준이 아니라, AI 에이전트의 구조적 활용 방법론을 적용했다.

### plan 모드로 전체 아키텍처 설계

파이프라인의 전체 구조를 Claude Code의 plan 모드에서 먼저 설계했다. 각 단계에서 해결해야 할 문제, 입력/출력 포맷, 단계 간 의존관계를 명확히 정의한 뒤 구현에 들어갔다. 이 설계 단계가 없었다면 구현 중 방향을 잃거나 되돌아가는 일이 훨씬 많았을 것이다.

### 서브 에이전트로 병렬 구현

각 단계의 구현은 **입력(input)과 출력(output)을 명시한 뒤, 서브 에이전트에게 병렬적으로 위임**했다. 예를 들어 "입력: IFC 파일 경로, 출력: 추출된 요소 리스트(JSON)" 같은 명세를 정의하고, 각 단계를 독립적으로 구현했다. 단계 간 인터페이스가 명확하므로 병렬 작업이 가능했다.

### 자동 테스트와 결과 보고

구현이 완료된 각 단계에 대해, **실제 IFC 파일을 입력으로 넣어 자동으로 테스트**하고, 결과를 보고서로 작성하도록 했다. "이 IFC 파일을 넣으면 몇 개의 요소가 추출되어야 하고, 생성된 타일의 총 크기는 얼마여야 한다"는 기대값과 실제값을 비교하는 방식이다. 이를 통해 각 단계의 정확성을 구현 직후에 검증할 수 있었다.

### AI 도구 활용의 핵심 교훈

Claude Code를 "코드 생성기"로 쓰면 품질이 낮다. **아키텍트로 활용**해야 한다. plan 모드에서 설계 → 명세 기반 위임 → 자동 테스트 → 보고서 검토의 사이클을 반복하면, 1인 개발자가 상당히 복잡한 시스템을 체계적으로 구축할 수 있다.

## 이 경험에서 추출한 원칙

1. **포맷 변환은 "파일 형식 바꾸기"가 아니라 "웹 렌더링 최적화"다.** IFC → glb 변환만으로는 충분하지 않다. 공간 분할, LOD, 압축까지 포함해야 웹에서 실용적으로 사용할 수 있는 3D Tiles가 된다.

2. **AI 도구는 "코드 생성기"가 아니라 "아키텍트"로 활용하라.** plan 모드로 설계, 명세 기반 위임, 자동 테스트의 사이클이 핵심이다. 이 구조가 없으면 AI가 생성한 코드의 품질을 보장할 수 없다.

3. **입력/출력을 명확히 정의하면 복잡한 시스템도 분해할 수 있다.** 각 단계의 인터페이스가 명확하면, 단계별로 독립 구현·테스트가 가능하고, AI 에이전트에게 위임하기도 쉬워진다.
