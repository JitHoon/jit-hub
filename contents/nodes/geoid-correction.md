---
slug: "geoid-correction"
title: "BIM 모델이 지면 아래 20m에 가라앉는 이유: 지오이드고"
cluster: "coordinate"
difficulty: "advanced"
prerequisites:
  - "coordinate-transform"
relatedConcepts:
  - slug: "coordinate-transform"
    relationship: "extends"
  - slug: "model-matrix"
    relationship: "appliedIn"
  - slug: "mesh-bim-pointcloud"
    relationship: "solves"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "appliedIn"
childConcepts: []
tags: ["geoid", "orthometric-height", "ellipsoidal-height", "vertical-datum", "cesium", "bim"]
---

# BIM 모델이 지면 아래 20m에 가라앉는 이유: 지오이드고

## 한 줄 요약

BIM 모델을 3D Tiles로 변환하여 Cesium에 로드했는데 화면에 아무것도 나타나지 않았다. 카메라를 지면 아래로 내려보니 건물 전체가 지표면 약 20m 아래에 있었다. BIM이 사용하는 높이(정표고)와 Cesium이 사용하는 높이(타원체고)의 차이를 국토지리정보원의 KNGeoid18 데이터로 자동 보정하여 해결했다.

## 건물이 보이지 않았다

BIM 모델을 3D Tiles로 변환하여 Cesium에 로드했는데, 화면에 아무것도 나타나지 않았다. coordinate-transform 노드에서 좌표 변환은 정확히 수행했다. 수평 위치(경도, 위도)는 맞았다.

카메라를 지면 아래로 내려보니, 건물 전체가 지표면 약 20m 아래에 위치하고 있었다. 건물이 땅에 묻혀 있었던 것이다.

## 두 가지 "높이"가 존재한다

| 높이 체계 | 기준면 | 사용처 | 특징 |
|-----------|--------|--------|------|
| 정표고(H) | 평균 해수면(지오이드) | BIM, 건설·측량 | "해발 고도". 물이 흐르는 방향을 정확히 반영 |
| 타원체고(h) | WGS84 타원체 | GPS, Cesium | 수학적으로 깔끔하지만 실제 해수면과 미세하게 다름 |

두 기준면 사이의 차이가 **지오이드고(N)**다:

```
타원체고(h) = 정표고(H) + 지오이드고(N)
```

지오이드고는 지구 내부의 질량 분포가 불균일하기 때문에 지역마다 다르다. 한국의 경우 대략 **20~30m** 범위에 분포한다. 같은 지점에서 정표고와 타원체고가 20~30m 차이가 날 수 있다는 뜻이다.

## 왜 문제가 되는가

Cesium 지구본 위에 3D 모델을 배치할 때, 높이 기준이 일치하지 않으면 모델이 잘못된 고도에 놓인다.

드론 이미지 기반 Mesh 모델은 상용 포토그래메트리 도구에서 타원체고 기준으로 출력 설정이 가능하다. **그러나 BIM 데이터는 정표고로만 입력된다.** 설계 소프트웨어에서 타원체고로 변환하는 옵션이 없다. BIM 모델을 Cesium에 그대로 올리면, 지오이드고만큼 **모델이 지면 아래에 가라앉는다**.

Mesh와 BIM이 같은 현장에 공존할 때 보정 없이는 Mesh는 정상인데 BIM만 가라앉아 보이는 현상이 발생한다.

이 문제는 이전 뷰어(Potree, 로컬 좌표 기반)에서는 발생하지 않았다. 지구본이 아니라 로컬 공간에 모델을 배치하므로 높이 기준면 자체가 문제되지 않았다.

## 보정 방법

BIM 모델의 중심 좌표(경도, 위도)에 해당하는 지오이드고(N)를 조회한 뒤, 모델의 높이에 N을 더해준다:

```
Cesium 배치 높이 = BIM 정표고(H) + 지오이드고(N) = 타원체고(h)
```

지오이드고 데이터는 국토지리정보원에서 제공하는 **KNGeoid18** 모델에서 조회한다. 이 데이터를 활용하여 특정 좌표의 지오이드고를 자동으로 조회하는 시스템을 구축했다.

이 보정은 coordinate-transform 노드의 좌표 변환과 함께, model-matrix 노드에서 최종 4×4 행렬로 합성된다. 또한 ifc-3dtiles-pipeline 노드의 파이프라인에서도 자동으로 적용된다.

## 이 경험에서 추출한 원칙

1. **높이는 "몇 미터"가 아니라 "무엇을 기준으로 몇 미터"다.** 같은 50m라도 정표고 50m와 타원체고 50m는 실제 위치가 20~30m 다르다.

2. **로컬 뷰어에서 글로벌 뷰어로 전환하면, 이전에 숨어있던 좌표 문제가 드러난다.** 로컬 공간에서는 기준면 차이가 문제되지 않지만, 지구본 위에 올리는 순간 모든 좌표가 글로벌 기준으로 통일되어야 한다.

BIM 모델이 Cesium에서 "보이지 않는다"면, 카메라를 지면 아래로 내려보라. 지오이드고만큼 가라앉아 있을 가능성이 높다.

## 공식 문서

- [국토지리정보원 KNGeoid18 지오이드 모델](https://www.ngii.go.kr/kor/content/view.do?sq=148) — 한국 지오이드고 데이터 공식 배포처
- [NGA EGM2008 글로벌 지오이드 모델](https://earth-info.nga.mil/index.php?dir=wgs84&action=wgs84) — 글로벌 타원체고-정표고 변환 기준 모델
