---
slug: "model-matrix"
title: "modelMatrix 위치·회전·스케일"
cluster: "implementation"
difficulty: "advanced"
prerequisites:
  - "coordinate-transform"
  - "geoid-correction"
  - "meridian-convergence"
relatedConcepts:
  - slug: "coordinate-transform"
    relationship: "consumes"
  - slug: "geoid-correction"
    relationship: "consumes"
  - slug: "meridian-convergence"
    relationship: "consumes"
  - slug: "measurement-tools"
    relationship: "usedBy"
childConcepts: []
tags: ["model-matrix", "cesium", "heading-pitch-roll", "matrix4", "coordinate", "y-up", "z-up"]
---

# modelMatrix 위치·회전·스케일

## 한 줄 요약

좌표계 변환, 지오이드고 보정, 자오선 수차 보정에서 구한 값들이 최종적으로 하나의 4×4 행렬(modelMatrix)로 합성되어 3D 모델을 Cesium 지구본 위에 배치한다. 이 행렬 하나로 모델의 위치, 회전, 스케일을 동시에 제어한다.

## modelMatrix란 무엇인가

3D 그래픽스에서 **modelMatrix**는 모델을 3D 공간에 배치하는 4×4 변환 행렬이다. 이 행렬 하나에 세 가지 정보가 담긴다:

- **위치(Translation)**: 모델을 어디에 놓을 것인가
- **회전(Rotation)**: 모델을 어떤 방향으로 돌릴 것인가
- **스케일(Scale)**: 모델을 얼마나 크게/작게 할 것인가

Cesium에서는 모든 3D Tiles 모델이 `modelMatrix` 속성을 가지며, 이 행렬을 수정하면 모델의 위치·회전·스케일이 실시간으로 변경된다.

## 왜 FE에서 modelMatrix를 직접 조작해야 했는가

이상적으로는 모든 모델 데이터가 Cesium이 사용하는 좌표계(ECEF)로 정확히 변환되어 있어야 한다. 그러면 modelMatrix를 건드릴 필요 없이 모델이 올바른 위치에 자동 배치된다.

그러나 현실은 달랐다. 기존에 로컬 좌표계(EPSG 5186)로 구축된 모델들이 이미 대량으로 존재했고, 이 모델들을 모두 ECEF 기준으로 재변환하는 것은 데이터팀의 업무량 측면에서 불가능했다. 이미 구축된 수십~수백 개의 모델을 전부 교체하는 것에는 한계가 있었다.

이 문제를 **프론트엔드에서 해결**했다. 모델 로드 시 modelMatrix를 동적으로 계산하여, 로컬 좌표계의 모델을 ECEF 기준으로 올바르게 배치하는 연산을 수행하는 것이다. 이렇게 하면 데이터팀의 기존 워크플로우를 변경하지 않으면서도, Cesium 지구본 위에 정확한 위치로 모델을 배치할 수 있다.

## modelMatrix 구성 과정

### 1단계: 위치 결정

좌표계 변환 노드에서 다룬 변환 체인의 결과물이 여기서 사용된다:

1. 모델의 로컬 좌표(EPSG 5186)를 경위도(WGS84)로 변환
2. 경위도를 Cesium의 API로 ECEF 좌표로 변환
3. BIM 모델의 경우, **지오이드고**를 높이에 더하여 타원체고 기준으로 보정

이 과정에서 float64 정밀도를 유지하는 것이 핵심이다.

### 2단계: 회전 결정

Cesium에서 모델의 방향은 **Heading-Pitch-Roll(HPR)** 체계로 표현된다:

- **Heading**: 북쪽 기준 시계 방향 회전 (수평면 위에서의 방위)
- **Pitch**: 수평면 기준 상하 기울기
- **Roll**: 진행 방향 축 기준 좌우 기울기

Cesium의 API를 사용하면 HPR 값과 위치를 기반으로 ENU → ECEF 변환 행렬을 생성할 수 있다. 자오선 수차 보정이 필요한 경우, Heading 값에 자오선 수차(γ)를 반영하여 방향을 보정한다.

### 3단계: 스케일 적용

Cesium의 API로 x, y, z 축별 스케일 행렬을 생성한다.

### 4단계: 행렬 합성

위치(Translation), 회전(Rotation), 스케일(Scale) 세 가지를 **하나의 4×4 행렬로 합성**한다.

행렬 곱셈은 **교환법칙이 성립하지 않는다** — 즉 A × B ≠ B × A다. 따라서 곱셈 순서에 따라 결과가 완전히 달라진다.

구체적으로 왜 다른지 예를 들면:

**먼저 이동하고 → 회전하면**: 모델이 원점에서 이동한 뒤, 원점을 중심으로 회전한다. 결과적으로 모델이 원점 주위를 **공전(orbit)**하게 된다.

**먼저 회전하고 → 이동하면**: 모델이 제자리에서 회전한 뒤, 회전된 상태 그대로 이동한다. 결과적으로 모델이 제자리에서 **자전(spin)**한 채로 목표 위치에 놓인다.

3D 모델을 지구본 위에 배치할 때 원하는 동작은 후자다 — 모델이 올바른 방향으로 돌아간 상태에서 목표 좌표에 놓이는 것이다. 3D 그래픽스에서 일반적으로 사용하는 적용 순서는 **Scale → Rotation → Translation**(스케일 먼저, 이동은 마지막)이지만, 실제로는 사용하는 라이브러리와 좌표계 관례에 따라 달라질 수 있다. 중요한 것은 **어떤 순서를 선택하든 그 순서를 일관되게 유지하는 것**이다.

합성된 행렬을 모델의 `modelMatrix` 속성에 할당하면, 모델이 지구본 위의 정확한 위치에 올바른 방향과 크기로 배치된다.

## Y-up vs Z-up 축 문제

modelMatrix 연산과 직접 관련은 아니지만, 3D 모델을 Cesium에 올릴 때 반드시 인식해야 하는 축 관례 차이가 있다.

**glTF/glb는 Y-up이 기본**이다. 화면의 위쪽이 Y축 양의 방향이다. 이것은 WebGL과 OpenGL의 관례를 따른 것이다.

**Cesium과 건설 CAD 소프트웨어(Civil 3D 등)는 Z-up이 기본**이다. 하늘 방향이 Z축 양의 방향이다. 이것은 측량·건설 분야의 관례다.

따라서 서로 다른 데이터 포맷 변환 과정에서 **축 변환을 고려**해야 한다. 축을 고려하지 않으면 모델이 옆으로 누워서 나타나거나, 위아래가 뒤집혀 보이는 현상이 발생한다. 이 문제는 데이터 변환 단계에서 해결하는 것이 적절하며, modelMatrix로 런타임에 보정하는 것보다 변환 시점에 축을 맞추는 것이 깔끔하다.

## 이 경험에서 추출한 원칙

1. **데이터를 바꿀 수 없으면, 렌더링 시점에서 보정하라.** 이상적으로는 데이터가 완벽해야 하지만, 현실에서는 레거시 데이터와 팀의 업무량 제약이 존재한다. FE에서 modelMatrix를 동적으로 계산하여 이 갭을 메우는 것은 실용적인 해결책이다.

2. **3D에서 "위"는 하나가 아니다.** Y-up과 Z-up은 단순한 관례 차이지만, 인식하지 못하면 모델이 누워서 나타나는 극적인 오류를 만든다. 데이터가 어떤 좌표 관례를 따르는지 항상 확인해야 한다.
