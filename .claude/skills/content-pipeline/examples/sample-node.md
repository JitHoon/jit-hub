---
slug: "coordinate-reference-system"
title: "좌표 참조 시스템 (CRS)"
cluster: "coordinate-systems"
difficulty: "intermediate"
prerequisites:
  - "geodetic-datum"
relatedConcepts:
  - slug: "map-projection"
    relationship: "appliedIn"
  - slug: "epsg-codes"
    relationship: "implements"
childConcepts:
  - "geographic-crs"
  - "projected-crs"
tags: ["CRS", "EPSG", "좌표계", "측지학"]
---

# 좌표 참조 시스템 (CRS)

좌표 참조 시스템은 지구 표면의 위치를 수학적으로 표현하기 위한 체계이다.

## 핵심 개념

CRS는 **데이텀**(기준 타원체)과 **좌표계**(표현 방식)의 조합이다.

- **지리 좌표계 (Geographic CRS)**: 위도/경도로 표현. WGS84(EPSG:4326)가 GPS 표준
- **투영 좌표계 (Projected CRS)**: 평면 좌표(미터)로 표현. UTM, TM 등

## 실무에서의 중요성

```typescript
// CesiumJS에서 CRS 변환 예시
const cartographic = Cesium.Cartographic.fromDegrees(126.978, 37.566);
const cartesian = Cesium.Cartesian3.fromDegrees(126.978, 37.566, 0);
```

3D GIS에서 서로 다른 CRS를 사용하는 데이터를 결합할 때, 정확한 좌표 변환이 필수적이다.

## 자주 사용되는 CRS

| EPSG 코드 | 이름     | 용도                 |
| ---------- | -------- | -------------------- |
| 4326       | WGS84    | GPS, 글로벌 표준     |
| 5186       | Korea TM | 한국 공간정보 표준   |
| 3857       | Web Mercator | 웹 지도 타일 시스템 |
