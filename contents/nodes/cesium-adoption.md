---
slug: "cesium-adoption"
title: "Cesium.js 도입 결정"
cluster: "discovery"
difficulty: "intermediate"
prerequisites:
  - "fbxloader-memory-leak"
relatedConcepts:
  - slug: "fbxloader-memory-leak"
    relationship: "triggeredBy"
  - slug: "potree-cesium-migration"
    relationship: "prerequisite"
  - slug: "3d-tiles-spec"
    relationship: "requires"
  - slug: "mesh-bim-pointcloud"
    relationship: "enables"
  - slug: "measurement-tools"
    relationship: "implemented"
  - slug: "coordinate-transform"
    relationship: "revealed"
  - slug: "ifc-3dtiles-pipeline"
    relationship: "built"
childConcepts: []
tags: ["cesium", "migration", "decision-making", "3d-viewer", "architecture"]
---

# Cesium.js 도입 결정

## 한 줄 요약

FBXLoader의 구조적 메모리 누수, Mesh 시각화 불가, 2D/3D 지도 부재 — 세 가지 한계가 동시에 드러났다. 비용·커스텀 자유도·데이터 보안을 기준으로 세 선택지를 비교한 끝에 Cesium.js 자체 구축을 결정했다.

## 다섯 가지 압력이 동시에 존재했다

이 결정의 출발점은 하나의 기술 문제가 아니라, 동시에 닥친 **여러 압력**이었다.

**메모리 문제**: FBXLoader의 메모리 누수를 dispose()로 완화했지만, 메모리 변동폭 자체는 개선되지 않았다. 이 문제의 상세는 fbxloader-memory-leak 노드에서 다룬다.

**비즈니스 요구**: 계약 가능성이 높은 고객사들이 Point Cloud뿐만 아니라 Mesh 모델 시각화를 필수 기능으로 요구하고 있었다.

**사용자 선호도**: 드론 촬영 이미지 텍스처가 입혀진 Mesh 모델은 실제 현장의 모습을 직관적으로 보여준다. Point Cloud 대비 시각적 현실감이 높아, 고객사 데모에서 일관되게 Mesh 기반 뷰를 요청받았다.

**경쟁 환경**: 동일 도메인의 경쟁 서비스들이 이미 Mesh 시각화를 제공하고 있었다.

**기존 뷰어의 구조적 한계**: 새로운 웹 최적화 데이터 형식 도입이 불가능했고, 커스텀 기능 개발과 디자인 적용이 어려웠으며, 건설 업계의 다양한 파일 포맷 지원도 부족했다.

## 기술 조사: Cesium의 입력 포맷에서 역산하기

조사는 "우리 데이터팀이 현재 뭘 뽑고 있는가"가 아니라, **"Cesium.js가 받아들일 수 있는 입력 포맷을 우리 데이터팀이 뽑아낼 수 있는가"**에서 출발했다.

Cesium.js가 지원하는 입력 포맷(glb, obj, ifc, geoJSON 등)을 먼저 확인한 뒤, 데이터팀이 기존 워크플로우에서 이 포맷들을 출력할 수 있는지 검증했다. 그 위에서 **웹에 가장 최적화된 포맷**과 **3D Tiles 변환의 중간 단계로 뽑아내기 좋은 포맷**을 중심으로 2주간 조사를 진행했다.

## 네 가지 선택지 비교

| 선택지 | 장점 | 단점 | 우리 상황에서의 판단 |
|--------|------|------|---------------------|
| 외부 API 기반 렌더링 | 도입 빠름 | 클라우드/API 비용 지속 발생, 커스텀 자유도 낮음, 데이터가 외부 서버 경유 | 보안·비용 모두 불리 |
| 클라우드 빌더 + Cesium.js | 빌드 과정 간편 | 서비스 비용, 빌드 과정 통제 불가 | 대용량 드론 데이터에서 비용 급증 |
| **자체 파이프라인 + Cesium.js** | **비용 통제·커스텀 자유도·데이터 보안 우세** | 초기 구축 비용 가장 큼 | **최종 선택** |
| Three.js 자체 구축 | 유연한 3D 렌더링 | 지리공간 기능(좌표계 변환, 지형 배치, 2D/3D 전환) 미내장 | 1인 개발 제약에서 비현실적 |

Three.js는 범용 3D 렌더링 라이브러리로, 지리공간(Geospatial) 기능이 내장되어 있지 않다. 좌표계 변환, 지형 위 모델 배치, 2D/3D 지도 전환 등을 모두 직접 구현해야 했다. 반면 Cesium은 이 기능들이 코어에 포함되어 있었다. 1인 개발이라는 리소스 제약에서 지리공간 기능을 처음부터 구현하는 것은 현실적으로 불가능했다.

Mapbox GL JS와 deck.gl도 검토 대상이었으나, 두 라이브러리는 2D 지도 위에 3D 레이어를 올리는 데 최적화되어 있다. 수천 개 타일로 구성된 대용량 3D Tiles를 LOD 기반으로 스트리밍하며 렌더링하는 것은 Cesium의 핵심 설계 목적이다. 건설 BIM 모델 수준의 대용량 3D 데이터 렌더링에서는 Cesium이 유일한 현실적 선택이었다.

## 설득 과정: 구두가 아니라 문서로

이 결정은 혼자 내린 것이 아니다. 체계적인 문서를 작성하고 전체 팀원을 모아 논의했다:

- 기존 문제 원인 분석 (메모리 누수 데이터)
- 기존 뷰어 vs Cesium 성능 비교 (벤치마크 결과)
- 3D Tiles 모델 형식 분석 (기술 타당성)
- 예상 작업 및 개발 기간 산정 (실현 가능성)

팀 전체가 동의하는 분위기였다. 백엔드 팀에서 S3 업로드 이벤트 연동과 EC2 인스턴스 관리 자동화를 담당하여, 프론트엔드에서 뷰어 전환에 집중할 수 있는 구조를 만들어줬다.

## 전환 결과

| 지표 | 전환 전 (Potree) | 전환 후 (Cesium) |
|------|-----------------|-----------------|
| 기능 커버리지 | 28개 | 43개 (+15개 신규) |
| Mesh 시각화 | 불가 | 가능 |
| 2D/3D 지도 전환 | 불가 | 가능 |
| 실시간 모델 편집 | 불가 | 가능 |
| 메모리 안정성 | 170MB 이상 누적 | 안정 범위 유지 |

PoC 3주 만에 기존 기능 대부분을 재현할 수 있다는 확신을 얻었다. 전체 마이그레이션 과정의 상세는 potree-cesium-migration 노드에서 다룬다.

## PoC에서 발견된 진짜 어려운 문제

Cesium.js를 실제 dev 환경에 올려보고 Mesh 업로드를 테스트했다. 모델이 화면에 바로 나타났고, FBXLoader에서 겪었던 메모리 누적 문제가 사라진 것을 확인했다.

**하지만 좌표계가 문제였다.** 기존 뷰어는 단순히 (0, 0, 0)을 원점으로 모델을 배치했고, 모델들은 EPSG 5186(한국 중부 좌표계)으로 이루어져 있어서 좌표 문제가 자연스럽게 해결됐다. 그러나 Cesium은 EPSG 4978(지심 직교 좌표계, ECEF)을 사용한다.

이 좌표 변환 문제가 coordinate-transform, geoid-correction, meridian-convergence 노드로 이어진다.

## 이 경험에서 추출한 원칙

1. **기술 선택은 기술적 우월성만으로 결정되지 않는다.** 비용, 보안, 팀 리소스, 비즈니스 요구사항을 함께 놓고 봐야 한다.

2. **설득은 구두가 아니라 문서로 한다.** 문제 분석, 벤치마크, 기술 비교, 일정 산정까지 체계적인 문서를 준비하고 팀 전체와 논의한 것이 합의를 이끌어낸 핵심이었다.

3. **PoC는 "되는지 확인"이 아니라 "어디서 막히는지 발견"이다.** Mesh가 화면에 나타나는 것을 확인한 건 시작에 불과했다. 진짜 어려운 문제(좌표계 변환)는 PoC 이후에 드러났다.

현재 3D 뷰어의 한계를 느끼고 있다면, "무엇을 교체할 것인가"보다 "교체 후 무엇이 달라져야 하는가"를 먼저 정의하라. 결과 기준으로 선택지를 비교하면 결정이 명확해진다.

## 공식 문서

- [CesiumJS 공식 문서](https://cesium.com/learn/cesiumjs-learn) — Cesium.js 시작 가이드, API 레퍼런스, 튜토리얼
- [Cesium ion 3D Tiles 지원 포맷 목록](https://cesium.com/platform/cesium-ion/content-pipeline) — glb, IFC, LAS 등 Cesium이 지원하는 입력 포맷 목록
