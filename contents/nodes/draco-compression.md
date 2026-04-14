---
slug: "draco-compression"
title: "Draco 압축으로 3D 메쉬 용량 65% 감소"
cluster: "performance"
difficulty: "intermediate"
prerequisites:
  - "3d-tiles-spec"
relatedConcepts:
  - slug: "ifc-3dtiles-pipeline"
    relationship: "usedIn"
  - slug: "ktx2-basis-universal"
    relationship: "complementary"
  - slug: "lod"
    relationship: "appliedAfter"
childConcepts: []
tags: ["draco", "compression", "geometry", "gltf", "mesh", "optimization"]
---

# Draco 압축으로 3D 메쉬 용량 65% 감소

## 한 줄 요약

3D 메쉬의 정점·인덱스 데이터를 양자화와 엔트로피 부호화로 65~70% 압축하여, 운영 프로젝트 기준 전체 모델 용량을 2,622MB에서 2,301MB로 줄였다(KTX2 텍스처 압축 포함). Google이 개발한 오픈소스 라이브러리(github.com/google/draco)이며, glTF 확장 KHR_draco_mesh_compression으로 Cesium에서 네이티브 지원된다.

## 텍스처만 압축하면 절반밖에 안 된다

ktx2-basis-universal 노드에서 텍스처 압축으로 GPU 메모리를 73% 절감했다. 그러나 3D 모델은 텍스처만으로 이루어진 것이 아니다. **정점(vertex)과 인덱스 데이터**가 파일 크기의 상당 부분을 차지한다. KTX2가 텍스처를 압축한다면, Draco는 형상(geometry) 자체를 압축한다. 둘은 경쟁이 아니라 상호 보완 관계다.

## Draco가 압축하는 것

3D 메쉬는 크게 두 가지 데이터로 구성된다:

**정점 데이터(Vertex Data)**: 각 정점의 위치(x, y, z), 법선 벡터, UV 좌표(텍스처 매핑용) 등. 정점 하나당 수십 바이트를 차지한다.

**인덱스 데이터(Index Data)**: 어떤 정점 3개를 연결하여 삼각형을 만드는지를 정의하는 데이터.

Draco는 이 두 가지를 **양자화(Quantization)와 엔트로피 부호화(Entropy Encoding)**로 압축한다.

### 양자화 (Quantization)

정점 위치를 float32로 저장하면 정밀도가 높지만, 데이터가 크다. 양자화는 이 부동소수점 값을 **더 적은 비트 수의 정수로 변환**한다. 예를 들어, 위치를 32비트 float 대신 11비트 정수로 양자화하면, 정밀도는 다소 떨어지지만 데이터 크기가 크게 줄어든다.

### 엔트로피 부호화 (Entropy Encoding)

양자화된 데이터에서 반복 패턴을 찾아 더 적은 비트로 표현한다. 인접한 정점들의 값이 비슷한 경우(평평한 면 등) 압축률이 높아진다.

## 양자화 레벨 결정: 시각적 품질과 압축률의 균형

양자화 비트 수가 핵심 파라미터다. 비트 수가 높을수록 정밀하지만 압축률이 낮고, 비트 수가 낮을수록 압축률은 높지만 형상이 뭉개질 수 있다.

테스트 단계에서 양자화를 공격적으로 적용하면 원본 대비 **최대 95%까지 파일 크기가 감소**했다. 그러나 이 수준에서는 모델의 모서리가 뭉개지거나 곡면이 각져 보이는 시각적 품질 저하가 발생했다.

드론 촬영 항공 모델에서 최적 레벨을 찾기 위해, 양자화 비트를 8~14 범위에서 단계별로 테스트했다. 각 단계에서 Cesium 뷰어에 로드하여 카메라를 근거리·중거리·원거리에서 비교했다. **11비트 양자화**에서 육안으로 품질 차이를 식별하기 어려우면서 65~70% 용량 감소를 달성하는 균형점을 찾았다.

모델 특성에 따라 최적 레벨은 달라진다. 곡면이 많은 모델(파이프, 원통)은 양자화에 민감하고, 직각 위주의 모델(벽, 슬래브)은 공격적 압축에도 시각적 변화가 적다.

## 운영 프로젝트 실측 결과

| 지표 | 값 |
|------|---|
| 전체 모델 파일 크기 | 2,622MB → 2,301MB (12.3% 감소, Draco + KTX2 합산) |
| BIM 모델 포맷 변환 | .fbx → .glb 시 33% 용량 감소 (편집 히스토리·메타데이터 제거) |
| 개별 타일 변환 속도 | 360KB .obj → .b3dm 약 1초 (obj2gltf + 3d-tiles-tools) |
| Draco 단독 압축률 | 정점·인덱스 데이터 65~70% 감소 |

.fbx → .glb 변환 시 33% 용량 감소의 이유: 3D 모델링 도구(Infra Works 등)가 삽입하는 편집 히스토리·레이어 메타데이터가 glTF 변환 시 제거된다.

## KTX2와의 관계: glb 파일 내에서 서로 다른 데이터를 압축

| 항목 | Draco | KTX2 |
|------|-------|------|
| 압축 대상 | 지오메트리 (정점, 인덱스) | 텍스처 (이미지) |
| glTF 확장 | KHR_draco_mesh_compression | KHR_texture_basisu |
| 디코딩 | CPU (WebAssembly) | CPU → GPU 직접 업로드 |
| 품질 트레이드오프 | 양자화 비트 수 | 코덱 선택 (ETC1S vs UASTC) |

두 압축은 독립적으로 적용된다. **둘 다 적용하면 지오메트리와 텍스처 모두 최적화**되어 파일 크기와 렌더링 성능이 동시에 개선된다.

## 이 경험에서 추출한 원칙

1. **최대 압축률이 최적 압축률은 아니다.** 95% 압축이 가능하다고 해서 그게 정답은 아니다. 사용자가 품질 저하를 느끼지 않는 범위 내에서 최대한 압축하는 것이 목표이며, 이 지점은 반복적인 테스트를 통해서만 찾을 수 있다.

2. **지오메트리 압축과 텍스처 압축은 별개의 문제다.** 둘은 서로 다른 데이터를 대상으로 하며, 서로 다른 원리로 작동한다.

현재 프로젝트의 glb 파일을 `gltf-transform inspect`로 분석해 보라. Draco 압축이 적용되지 않은 파일이 있다면 즉시 적용 가능한 최적화 대상이다.

## 공식 문서

- [Google Draco 공식 GitHub](https://github.com/google/draco) — Draco 압축 라이브러리 소스 및 파라미터 레퍼런스
- [glTF KHR_draco_mesh_compression 확장 스펙](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_draco_mesh_compression/README.md) — glb 파일에 Draco를 적용하는 공식 glTF 확장 명세
