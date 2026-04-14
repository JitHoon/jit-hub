---
slug: "coordinate-transform"
title: "좌표계를 잘못 설정하면 모델이 지구 반대편에 렌더링된다"
cluster: "coordinate"
difficulty: "advanced"
prerequisites:
  - "cesium-adoption"
  - "3d-tiles-spec"
relatedConcepts:
  - slug: "geoid-correction"
    relationship: "requires"
  - slug: "meridian-convergence"
    relationship: "requires"
  - slug: "model-matrix"
    relationship: "appliedIn"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "appliedIn"
childConcepts:
  - "geoid-correction"
  - "meridian-convergence"
tags: ["coordinate-system", "epsg", "wgs84", "ecef", "proj4js", "float64", "cesium"]
---

# 좌표계를 잘못 설정하면 모델이 지구 반대편에 렌더링된다

## 한 줄 요약

BIM 모델을 Cesium에 올렸을 때 모델이 의도한 위치에서 수백 km 떨어진 지점에 렌더링됐다. EPSG:5186 → WGS84 → ECEF 세 단계 변환 파이프라인을 proj4js로 구축하고, 변환 체인 전체에서 float64 정밀도를 유지하여 오차를 1~5cm 이내로 줄였다.

## 모델이 엉뚱한 곳에 나타났다

Cesium 도입 PoC에서 기존 BIM 모델을 올렸을 때, 모델이 서울이 아니라 의도한 위치에서 수백 km 떨어진 지점에 렌더링됐다.

좌표값 자체는 정확했다. 문제는 좌표계(EPSG:5186)와 Cesium 내부 좌표계(ECEF)의 원점과 축이 다르다는 사실을 모른 채 변환 없이 그대로 입력한 것이었다. 이 문제가 cesium-adoption 노드의 PoC에서 "기뻤지만 좌표계가 문제였다"로 이어진 직접적인 원인이다.

기존 뷰어(Potree 기반)에서는 좌표 변환이 필요 없었다. 뷰어가 (0, 0, 0)을 원점으로 사용했고, 모델들은 EPSG 5186으로 이루어져 있었기 때문에 로컬 좌표를 그대로 사용할 수 있었다.

## 세 가지 좌표계

| 좌표계 | 용도 | 단위 | 특징 |
|--------|------|------|------|
| EPSG 5186 | 한국 건설·측량 | 미터 (평면) | 직관적이지만 한국 밖에서는 왜곡 |
| WGS84 (EPSG 4326) | GPS, 글로벌 | 도 (경위도) | 지구 전체 표현 가능, 거리 계산 비직관적 |
| ECEF (EPSG 4978) | Cesium 내부 | 미터 (3D) | 지구 중심이 원점, 값이 수백만 단위 |

## 변환 체인: EPSG:5186 → WGS84 → ECEF

### 1단계: 로컬 좌표 → 경위도 (proj4js)

EPSG 5186의 Easting/Northing 값을 WGS84의 경도/위도로 변환한다. **proj4js**는 수천 개의 좌표계 간 변환을 지원하는 JavaScript 라이브러리로, 좌표 변환의 사실상 표준이다.

proj4js 외에 Cesium 내장 좌표 변환 API도 검토했으나, Cesium은 WGS84/ECEF 간 변환만 지원하고 EPSG 5186 같은 로컬 좌표계는 지원하지 않는다. GDAL의 JavaScript 바인딩(gdal-async)도 검토했으나, Node.js 네이티브 모듈 의존성이 브라우저 환경에서 사용 불가하다. proj4js가 브라우저에서 동작하면서 EPSG 5186을 지원하는 유일한 선택이었다.

### 2단계: 경위도 → Cesium 내부 좌표

Cesium의 `Cartesian3.fromDegrees(경도, 위도, 높이)` API로 경위도를 ECEF 직교 좌표로 변환한다.

### 3단계: modelMatrix로 배치

변환된 ECEF 좌표를 기반으로 modelMatrix를 구성하여 3D 모델을 지구본 위에 배치한다. 이 과정의 상세는 model-matrix 노드에서 다룬다.

## float64 정밀도 — 가장 찾기 어려운 함정

이 변환 체인에서 가장 어렵고 발견하기 힘든 문제는 **수치 정밀도**였다.

| 좌표계 | 값의 크기 | float32 단일 단계 오차 |
|--------|----------|---------------------|
| EPSG 5186 | ~95만~195만 m | 1~5 cm |
| 경위도 | 127도 | ~18 cm |
| ECEF | ~300만~400만 m | ~10 cm |

단일 단계의 오차는 미세하다. 그러나 **변환 체인에서 각 단계마다 정밀도 손실이 누적**되고, modelMatrix 구성 시 행렬 연산에서 오차가 증폭될 수 있다.

이 문제가 까다로운 이유는, 모델이 지구 반대편에 나타나는 극적인 오류가 아니라 건물이 실제 위치에서 수십 cm~수 m 어긋나는 미세한 현상으로 나타난다는 것이다. "좌표 변환 로직의 버그인가, 원본 데이터의 문제인가, 수치 정밀도인가"를 구분하는 데 상당한 시간이 소요됐다.

최종적으로 **변환 체인 전체에서 float64(JavaScript Number 기본)를 일관되게 유지**하고, 중간 단계에서 Float32Array나 WebGL 셰이더를 거치지 않도록 하여 해결했다.

## 이 경험에서 추출한 원칙

1. **좌표 변환은 "값을 바꾸는 것"이 아니라 "세계관을 바꾸는 것"이다.** 각 좌표계가 어떤 전제(평면 vs 구면 vs 3D 직교) 위에 있는지를 이해해야 올바른 변환을 할 수 있다.

2. **정밀도 문제는 "값이 틀렸는가"보다 "어떤 정밀도로 연산되고 있는가"가 핵심이다.** GIS 도메인에서 좌표는 값의 크기(수백만 미터)와 요구 정밀도(센티미터)의 차이가 크기 때문에 float32의 유효 자릿수 약 7자리로는 부족하다.

3. **변환 체인의 모든 단계에서 정밀도를 일관되게 유지하라.** 중간에 float32로 떨어지는 지점이 하나라도 있으면 최종 결과의 정밀도가 훼손된다.

좌표 변환이 필요한 프로젝트를 시작한다면, 변환 체인의 각 단계에서 동일한 테스트 좌표를 넣고 출력을 확인하라. 기대값과의 오차가 요구 정밀도 내인지 단계마다 검증하는 것이 나중에 디버깅 시간을 크게 줄여준다.

## 공식 문서

- [proj4js 공식 문서 및 EPSG 좌표계 지원 목록](https://proj4js.org) — 브라우저에서 EPSG 5186 등 로컬 좌표계 변환 구현 시 참고
- [Cesium Cartesian3.fromDegrees API](https://cesium.com/learn/cesiumjs/ref-doc/Cartesian3.html#.fromDegrees) — 경위도 → ECEF 변환 공식 레퍼런스
- [EPSG:5186 좌표계 정의 (epsg.io)](https://epsg.io/5186) — 한국 중부 좌표계 파라미터 공식 명세
