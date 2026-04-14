---
slug: "measurement-tools"
title: "유료 API 없이 직접 구현한 Cesium 측정 도구 7종"
cluster: "feature"
difficulty: "advanced"
prerequisites:
  - "cesium-adoption"
  - "cesium-mouse-events"
  - "model-matrix"
relatedConcepts:
  - slug: "cesium-mouse-events"
    relationship: "builtOn"
  - slug: "model-matrix"
    relationship: "uses"
  - slug: "mesh-bim-pointcloud"
    relationship: "analyzes"
  - slug: "area-calculation"
    relationship: "uses"
childConcepts:
  - "area-calculation"
tags: ["measurement", "distance", "area", "angle", "profile", "clipping-plane", "cesium", "3d-tools", "fov", "orthographic"]
---

# 유료 API 없이 직접 구현한 Cesium 측정 도구 7종

## 한 줄 요약

Cesium.js 위에서 거리, 면적, 각도, 수직거리, 수평거리, 원, Profile(단면도) 7종의 측정 도구를 직접 설계·구현했다. Cesium은 이 기능을 유료 구독(연 약 100만 원)으로 제공하지만, 이를 직접 구현하여 대체했다. 가장 까다로웠던 Profile은 Clipping Plane, FOV 축소 기반 유사 직교 투영, 두 뷰어 간 동기화까지 세 가지 기술 영역이 교차하는 구현이었다.

## 7종 측정 도구

모든 도구는 cesium-mouse-events 노드에서 다룬 동일한 인터랙션 패턴을 따른다.

| 도구 | 입력 | 출력 |
|------|------|------|
| 거리 | 다수의 점 | 구간별 거리 + 총 거리 |
| 면적 | 다수의 점 (폐합) | 둘레 길이 + 면적 |
| 각도 | 3개의 점 | 세 점이 이루는 각도 |
| 수직·수평 거리 | 2개의 점 | 수직 성분 + 수평 성분 분리 |
| 원 | 중심 + 반지름 점 | 반지름 거리 |
| **Profile (단면도)** | 2개의 점 | **단면 시각화** |

거리·각도·원은 Cesium의 Cartesian3 벡터 연산으로 구현한다. 면적 계산은 별도 알고리즘이 필요하며, area-calculation 노드에서 다룬다.

나머지 6종 도구는 Cesium의 기본 API(거리 계산, 면적 계산 등)를 조합하여 구현할 수 있었지만, **Profile은 3D 공간의 단면을 2D 그래프로 변환**해야 하므로 카메라 투영, 좌표 변환, 캔버스 렌더링까지 세 가지 영역의 조합이 필요했다.

## Profile — 가장 어려웠던 도구

### Clipping Plane으로 모델을 자른다

사용자가 두 점을 찍으면, 그 두 점을 잇는 직선을 기준으로 수직 Clipping Plane을 생성하여 모델을 자른다. mesh-bim-pointcloud 노드에서 다뤘듯, Mesh를 자르면 실처럼 나오고 Point Cloud를 자르면 의미 있는 단면이 나타난다.

### 직교 투영 대신 FOV 축소

단면도를 정면에서 볼 때, 원근 투영이 적용되면 단면이 왜곡된다. 이론적으로는 직교 투영(orthographic projection)이 정석이다. 그러나 Cesium에서 직교 투영을 활성화하면 **카메라 조작이 멈추는 자체 버그**가 있었다.

대안으로 **카메라 FOV(Field of View)를 극단적으로 좁히는 방법**을 선택했다. FOV를 1~2도로 좁히면 카메라를 멀리 떨어뜨려야 하고, 장면 내 모든 물체의 카메라 거리 비율이 1에 수렴한다. 모든 물체가 "거의 같은 거리"에 있는 것처럼 보이므로 직교 투영과 사실상 동일한 결과가 된다.

### 카메라 고정과 뷰어 동기화

카메라를 단면 측면에 고정하고, 수평·수직 이동만 허용하여 단면도를 평면적으로 탐색할 수 있게 했다. 메인 뷰어와 단면도 뷰어 간 마우스 위치 동기화는 cesium-mouse-events 노드에서 다룬 싱글톤 이벤트 매니저(Pub/Sub)로 처리했다.

## 이 경험에서 추출한 원칙

1. **이론적 정석이 적용 불가능할 때, 결과가 동등한 우회 방법을 찾아라.** 직교 투영이 정석이지만 Cesium 버그로 불가능했을 때, FOV 축소라는 대안이 동등한 결과를 만들었다.

2. **하나의 도구 안에 여러 기술 영역이 교차한다.** Profile 하나를 구현하려면 Clipping Plane, 카메라 제어, 투영 방식, 뷰어 간 동기화가 모두 필요했다.

Cesium에서 유료 측정 기능에 의존하고 있다면, Cartesian3 벡터 연산과 ScreenSpaceEventHandler만으로 기본 측정 도구를 직접 구현할 수 있다. 가장 간단한 거리 측정부터 시도해 보라.
