---
slug: "3d-tiles-spec"
title: "3D Tiles 스펙"
cluster: "format"
difficulty: "advanced"
prerequisites:
  - "cesium-adoption"
relatedConcepts:
  - slug: "cesium-adoption"
    relationship: "requiredBy"
  - slug: "mesh-bim-pointcloud"
    relationship: "visualizes"
  - slug: "coordinate-transform"
    relationship: "requires"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "targetOf"
  - slug: "lod"
    relationship: "controls"
  - slug: "draco-compression"
    relationship: "appliedTo"
  - slug: "ktx2-basis-universal"
    relationship: "appliedTo"
  - slug: "measurement-tools"
    relationship: "enabledBy"
childConcepts:
  - "lod"
tags: ["3d-tiles", "ogc", "b3dm", "glb", "pnts", "tileset-json", "geometric-error"]
---

# 3D Tiles 스펙

## 한 줄 요약

대용량 3D 모델을 LOD 기법을 활용하여 계층화한, 웹에 최적화된 3D 데이터 스펙이다. OGC 국제 표준이며, Cesium이 만들었다.

---

## 3D Tiles가 해결하는 문제

드론으로 촬영한 수천 장의 이미지로 만든 Mesh 모델은 쉽게 수 GB를 넘긴다. 이걸 웹 브라우저에 통째로 올리면 메모리가 폭발한다 — 이전에 FBXLoader에서 경험했던 바로 그 문제다.

3D Tiles는 이 문제를 **"한 번에 다 올리지 않는다"**는 원칙으로 해결한다. 전체 모델을 작은 타일 조각으로 나누고, 카메라에서 가까운 타일은 정밀하게, 먼 타일은 대략적으로 보여준다. 사용자가 카메라를 움직이면 필요한 타일만 새로 로드하고, 안 보이는 타일은 메모리에서 해제한다.

이것이 가능한 이유는 3D Tiles가 **계층적 구조**를 가지기 때문이다. 하나의 큰 타일 안에 더 정밀한 하위 타일이 들어있고, 그 안에 더 정밀한 타일이 또 들어있다. 카메라가 가까워지면 하위 타일로 교체(refine)하고, 멀어지면 상위 타일로 돌아간다.

## tileset.json — 3D Tiles의 목차

3D Tiles의 진입점은 `tileset.json` 파일이다. 이 파일은 "어떤 타일이 어디에 있고, 얼마나 정밀한지"를 서술하는 목차 역할을 한다.

```json
{
  "asset": { "version": "1.1" },
  "geometricError": 500.0,
  "root": {
    "boundingVolume": {
      "region": [2.19, 0.61, 2.20, 0.62, 0, 100]
    },
    "geometricError": 100.0,
    "refine": "REPLACE",
    "content": { "uri": "tile_root.glb" },
    "children": [
      {
        "boundingVolume": { "region": [...] },
        "geometricError": 10.0,
        "content": { "uri": "tile_detail_1.glb" }
      }
    ]
  }
}
```

핵심 구성 요소 세 가지:

**boundingVolume**: 이 타일이 3D 공간에서 차지하는 영역. region(경위도 범위), box(직육면체), sphere(구) 중 하나로 정의한다. 실무에서는 Cesium 지구본 위에 모델을 배치해야 하므로 `region`을 주로 사용했으며, 이 값은 `[서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도, 최소 높이, 최대 높이]` 형태다(라디안 단위).

**geometricError**: 이 타일의 기하학적 오차. 단위는 미터다. 이 값이 클수록 "이 타일은 정밀하지 않다"는 뜻이다. 상세 설명은 아래 "geometricError 심층 이해" 섹션에서 다룬다.

**refine**: 하위 타일로 전환할 때의 전략. `"REPLACE"`는 상위 타일을 하위 타일로 완전히 교체한다. `"ADD"`는 상위 타일 위에 하위 타일을 추가로 겹친다. Mesh 모델에서는 주로 REPLACE를, Point Cloud에서는 ADD를 사용하는 경향이 있다.

## 타일 포맷: b3dm, glb, pnts

tileset.json이 목차라면, 실제 3D 데이터가 담긴 파일이 타일이다. 실무에서 사용한 포맷은 세 가지다.

### b3dm (Batched 3D Model)

Mesh 데이터를 담는 바이너리 포맷이다. 내부에 glTF/glb 데이터가 들어있고, 거기에 배치 테이블(Batch Table)이라는 메타데이터 레이어가 추가된다. 배치 테이블은 "이 타일 안의 100개 건물 각각의 이름, 용도, 면적" 같은 개별 속성 정보를 담을 수 있다.

실무에서 드론이미지 → 3D Tiles 경로에서 b3dm을 사용하게 된 것은, 상용 포토그래메트리 도구가 출력하는 기본 포맷이 b3dm이었기 때문이다. glb로 직접 출력할 수 있었는지는 당시에 충분히 검토하지 못한 부분이며, 이 점은 아쉬움으로 남아있다.

### glb (Binary glTF)

glTF 2.0의 바이너리 버전으로, JSON 메타데이터와 바이너리 기하학 데이터를 하나의 파일에 담는다. b3dm과 달리 별도의 배치 테이블 레이어 없이 glTF 자체의 구조를 사용한다. 3D Tiles 1.1부터는 glb를 타일로 직접 사용할 수 있게 되었다.

실무에서 IFC → 3D Tiles 자체 파이프라인을 구축할 때는 glb를 타일 포맷으로 선택했다. b3dm으로 한 번 더 감쌀 필요 없이 glb 자체를 Cesium에서 직접 로드할 수 있었기 때문이다.

### b3dm vs glb — 실무에서의 차이

| 항목 | b3dm | glb |
|------|------|-----|
| 내부 구조 | 헤더 + 배치 테이블 + glb | 순수 glTF 2.0 바이너리 |
| 메타데이터 | Batch Table (타일 내 개별 객체 속성) | glTF extensions 활용 |
| 3D Tiles 버전 | 1.0부터 지원 | 1.1부터 타일로 직접 사용 가능 |
| 사용 사례 | 드론이미지 기반 Mesh (상용 도구 출력) | IFC 기반 BIM (자체 파이프라인) |

핵심 차이는, b3dm은 3D Tiles 1.0 시대에 glTF를 타일로 쓰기 위해 만든 래퍼(wrapper)이고, 3D Tiles 1.1부터는 glb를 직접 타일로 쓸 수 있게 되면서 점차 glb 직접 사용이 권장되는 추세라는 것이다.

### pnts (Point Cloud)

Point Cloud 데이터를 담는 바이너리 포맷이다. 각 점의 위치(x, y, z), 색상(RGB), 그리고 선택적으로 법선 벡터, 강도(intensity) 등의 속성을 저장한다.

Cesium에서 Point Cloud를 시각화하려면 **pnts가 유일한 선택지**다. 다른 포맷은 지원되지 않는다.

Point Cloud를 유지해야 했던 실무적 이유가 있었다: **단면도(Profile) 기능**의 구현에 필요했기 때문이다. 기존 뷰어에서는 특정 직선 위의 포인트와 색상 정보를 한 번에 가져올 수 있었지만, Cesium에서는 그런 API가 없었다. 대신 pnts로 올린 Point Cloud 모델을 **Clipping Plane으로 잘라서 옆면을 보여주는 방식**으로 단면도를 구현했다. 이 접근법의 상세 내용은 "측정 도구 7종" 노드에서 다룬다.

## geometricError 심층 이해

geometricError는 3D Tiles에서 가장 중요하면서도 직관적으로 이해하기 어려운 개념이다.

### 정의

geometricError는 **"이 타일이 원본 데이터를 얼마나 부정확하게 표현하는가"**를 미터 단위로 나타낸 값이다. 이 값이 0이면 원본과 완전히 동일하다는 뜻이고, 값이 클수록 원본에서 크게 단순화된 타일이라는 뜻이다.

### 어떻게 사용되는가

핵심 원리는 **"같은 1미터라도, 가까이서 보면 크게 보이고, 멀리서 보면 작게 보인다"**는 것이다.

어떤 타일의 geometricError가 10미터라고 하자. "이 타일은 원본 대비 최대 10미터 정도 부정확하다"는 뜻이다.

**카메라가 100미터 거리에 있을 때**: 10미터 오차는 화면에서 꽤 큰 부분을 차지한다. 건물 한 층 정도가 뭉개져 보일 수 있다. → Cesium은 "이건 너무 부정확하다, 더 정밀한 하위 타일을 로드하자"고 판단한다.

**카메라가 10,000미터(10km) 거리에 있을 때**: 같은 10미터 오차는 화면에서 겨우 1~2픽셀 정도다. 사람 눈으로는 구분이 안 된다. → Cesium은 "이 정도면 충분하다, 이 타일 그대로 보여주자"고 판단한다.

이것이 "미터 단위의 오차를 화면상의 픽셀 오차로 환산한다"는 말의 의미다. **카메라 거리와 화면 해상도를 고려하여, 이 오차가 화면에서 몇 픽셀로 보이는가를 계산**하고, 그 픽셀 수가 허용 임계값(`maximumScreenSpaceError`, 기본값 16픽셀)을 넘으면 더 정밀한 하위 타일을 로드한다.

### 실무에서의 의미

IFC → 3D Tiles 파이프라인에서 LOD를 생성할 때, 각 LOD 단계의 geometricError를 적절히 설정해야 했다. 값이 너무 작으면 멀리서도 고해상도 타일을 로드하여 메모리를 낭비하고, 너무 크면 가까이 가도 저해상도 타일이 유지되어 시각적 품질이 떨어진다.

파이프라인에서는 LOD 단계별로 정점을 2~15%로 단순화하면서, 각 단계의 geometricError를 단순화 비율에 비례하도록 설정했다. 이 값의 튜닝은 "시각 품질"과 "메모리 사용량" 사이의 트레이드오프이며, 최적값은 모델의 크기와 디테일 수준에 따라 달라진다.

## 이 경험에서 추출한 원칙

1. **스펙을 "사용"하는 것과 "이해"하는 것은 다르다.** b3dm을 매일 다뤄도 geometricError의 정확한 작동 원리를 모를 수 있다. 깊이 있는 이해는 의도적으로 파고들어야 생긴다.

2. **도구의 출력 포맷에 끌려가지 말고, 스펙의 선택지를 먼저 파악하라.** 상용 도구가 b3dm을 뽑아주니까 b3dm을 쓴 것은 결과적으로 동작했지만, glb 직접 사용이 가능했는지 먼저 검토했다면 더 나은 선택을 할 수 있었을 것이다.

---

## 연결된 노드

- **← Cesium.js 도입 결정** (이 스펙을 요구한 의사결정)
- **→ Mesh·BIM·Point Cloud** (이 스펙이 시각화하는 데이터 유형)
- **→ 좌표계 변환** (boundingVolume의 region이 요구하는 좌표 체계)
- **→ IFC→3D Tiles 파이프라인** (이 스펙의 타일을 생성하는 시스템)
- **→ LOD 레벨 오브 디테일** (geometricError가 제어하는 메커니즘)
- **→ Draco 지오메트리 압축** (glb 타일에 적용되는 압축)
- **→ KTX2 Basis Universal** (타일 내 텍스처에 적용되는 압축)
- **→ 측정 도구 7종** (pnts + Clipping Plane으로 구현한 단면도)
