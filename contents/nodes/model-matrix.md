---
slug: "model-matrix"
title: "3D 모델을 지구 위 정확한 위치에 배치하기: modelMatrix"
cluster: "coordinate"
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

# 3D 모델을 지구 위 정확한 위치에 배치하기: modelMatrix

## 한 줄 요약

좌표 변환·지오이드고·자오선 수차 보정에서 구한 값들이 하나의 4×4 행렬(modelMatrix)로 합성되어 3D 모델을 Cesium 지구본 위에 배치한다. 건물 모델을 올렸는데 90도 옆으로 누워 있었다. Y-up(glTF)과 Z-up(Cesium) 축 관례 차이가 원인이었다.

## 건물이 90도 옆으로 누워 있었다

좌표 변환을 거쳐 Cesium에 올린 건물 모델이 90도 옆으로 누워 있었다. 좌표는 맞았는데 방향이 틀렸다. glTF/glb는 Y축이 위를 가리키고(Y-up), Cesium과 건설 CAD 소프트웨어는 Z축이 위를 가리킨다(Z-up). 축 관례의 차이였다.

## modelMatrix가 하는 일

3D 그래픽스에서 **modelMatrix**는 모델을 3D 공간에 배치하는 4×4 변환 행렬이다. 세 가지 정보가 하나의 행렬에 담긴다:

- **위치(Translation)**: 어디에 놓을 것인가
- **회전(Rotation)**: 어떤 방향으로 돌릴 것인가
- **스케일(Scale)**: 얼마나 크게/작게 할 것인가

## 왜 FE에서 modelMatrix를 직접 조작해야 했는가

이상적으로는 모든 모델 데이터가 ECEF로 정확히 변환되어 있어야 한다. 그러나 기존에 EPSG 5186으로 구축된 모델이 수십~수백 개 존재했고, 모두 재변환하는 것은 데이터팀의 업무량 측면에서 불가능했다.

**프론트엔드에서 해결**했다. 모델 로드 시 modelMatrix를 동적으로 계산하여, 로컬 좌표계의 모델을 ECEF 기준으로 배치했다. 데이터팀의 워크플로우를 변경하지 않으면서 정확한 배치를 달성했다.

## 구성 과정

### 1단계: 위치 — coordinate-transform + geoid-correction

1. EPSG 5186 → WGS84(경위도) 변환 (proj4js)
2. 경위도 → ECEF 변환 (Cesium API)
3. BIM 모델: 지오이드고를 높이에 더하여 타원체고로 보정

### 2단계: 회전 — Heading-Pitch-Roll + 자오선 수차

Cesium의 **HPR** 체계로 방향을 표현한다. 자오선 수차 보정이 필요한 경우 Heading 값에 γ를 반영한다.

### 3단계: 행렬 합성 — 순서가 결과를 결정한다

행렬 곱셈은 **교환법칙이 성립하지 않는다** (A × B ≠ B × A).

- **먼저 이동 → 회전**: 모델이 원점 주위를 **공전(orbit)**
- **먼저 회전 → 이동**: 모델이 제자리에서 **자전(spin)**한 채 목표 위치에 놓임

원하는 동작은 후자다. 일반적인 적용 순서: **Scale → Rotation → Translation**. 중요한 것은 어떤 순서를 선택하든 일관되게 유지하는 것이다.

## Y-up vs Z-up

| 관례 | 사용처 | "위" 방향 |
|------|--------|----------|
| Y-up | glTF/glb, WebGL, OpenGL | Y축 |
| Z-up | Cesium, 건설 CAD (Civil 3D) | Z축 |

이 차이를 무시하면 모델이 옆으로 누워 나타난다. 데이터 변환 단계에서 축을 맞추는 것이 깔끔하다.

## 이 경험에서 추출한 원칙

1. **데이터를 바꿀 수 없으면, 렌더링 시점에서 보정하라.** FE에서 modelMatrix를 동적으로 계산하여 레거시 데이터와 팀 제약의 갭을 메웠다.

2. **3D에서 "위"는 하나가 아니다.** Y-up과 Z-up은 단순한 관례 차이지만, 인식하지 못하면 모델이 누워서 나타나는 극적인 오류를 만든다.

3D 모델이 Cesium에서 이상하게 배치된다면, 먼저 축 관례(Y-up vs Z-up)를 확인하라. 좌표 변환 로직보다 축 관례 불일치가 원인인 경우가 많다.
