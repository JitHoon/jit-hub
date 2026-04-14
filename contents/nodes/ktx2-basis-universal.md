---
slug: "ktx2-basis-universal"
title: "KTX2 Basis Universal"
cluster: "performance"
difficulty: "advanced"
prerequisites:
  - "3d-tiles-spec"
  - "gpu-texture-formats"
relatedConcepts:
  - slug: "draco-compression"
    relationship: "complementary"
  - slug: "gpu-texture-formats"
    relationship: "transcodesTo"
childConcepts: []
tags: ["ktx2", "basis-universal", "texture-compression", "etc1s", "uastc", "gpu", "webgl", "gltf"]
---

# KTX2 Basis Universal

## 한 줄 요약

3D 뷰어에서 텍스처가 많은 모델을 열 때마다 GPU 메모리가 75MB씩 점유됐다. KTX2 + Basis Universal(ETC1S 모드)로 변환한 결과, GPU 메모리 75MB → 20MB(73% 절감), 모델 로드 메모리 1.3GB → 0.4GB(69% 감소), 초기 로드 시간 28초 → 20초(28% 단축)를 달성했다.

## 텍스처가 GPU 메모리를 잡아먹고 있었다

3D 뷰어에서 텍스처가 많은 모델을 열 때마다 GPU 메모리가 급증했다. gpu-texture-formats 노드에서 다뤘듯, GPU는 JPEG을 직접 읽지 못한다. 브라우저가 JPEG을 받으면 CPU에서 비압축 RGBA로 디코딩한 뒤 GPU에 업로드한다. 2048×2048 텍스처 1장이 GPU에서 **16MB**를 차지한다.

드론 촬영 기반 Mesh 모델은 수천 장의 텍스처 타일을 가진다. 이 텍스처들이 GPU에서 16MB씩 차지하면 VRAM이 빠르게 소진된다.

## KTX2 + Basis Universal의 해결 방식

KTX2는 **GPU가 직접 읽을 수 있는 압축 포맷으로 텍스처를 저장**하는 컨테이너 포맷이다 (Khronos KTX 2.0 Specification). Basis Universal은 그 안에서 사용되는 중간 압축 방식이다.

```
JPEG 방식:  서버(JPEG) → CPU 디코딩 → GPU에 16MB 업로드
KTX2 방식:  서버(KTX2) → CPU 트랜스코딩 → GPU에 4MB 업로드 (압축 유지)
```

GPU에 올라가는 시점이 핵심이다. JPEG은 비압축 상태로 올라가지만, KTX2는 GPU 네이티브 압축 포맷 그대로 올라간다.

## ETC1S vs UASTC: 왜 ETC1S를 선택했는가

| 항목 | ETC1S | UASTC |
|------|-------|-------|
| GPU 메모리 | 4 bpp | 8 bpp |
| 디스크 크기 | 0.3~1.25 bpp | 2~6 bpp |
| 품질 | 중~저 | 높음 (BC7에 준함) |
| 적합한 용도 | 대량 타일, 항공/드론 텍스처 | 건축/제품, 노멀맵, 고품질 필수 |

ETC1S를 선택한 이유는 **용량 절감이 최우선**이었기 때문이다. 수천 개의 드론 촬영 텍스처 타일에서 UASTC를 사용하면 GPU 메모리가 2~4배 증가한다.

ETC1S의 품질 손실이 체감되는지 확인하기 위해, 동일 현장의 드론 촬영 모델을 ETC1S와 UASTC로 각각 변환한 뒤 Cesium 뷰어에서 비교했다. 항공 촬영 이미지는 카메라가 수십~수백 미터 상공에서 촬영하므로 텍스처 디테일이 원래 높지 않다. ETC1S의 압축 아티팩트가 **육안으로 구분되지 않았다**.

만약 의료 영상이나 문화재 복원처럼 텍스처 품질이 절대적인 도메인이라면, UASTC가 적합하다.

## 트랜스코딩: 하나의 파일로 모든 기기 대응

Basis Universal의 핵심 가치는 **"서버에 하나의 파일만 저장하면 된다"**는 것이다. 브라우저(CesiumJS)가 KTX2 파일을 로드하면, WebGL extension을 확인하여 GPU가 지원하는 포맷으로 자동 트랜스코딩한다:

- 데스크탑 → **BC7**
- iPhone/iPad, 최신 Android → **ASTC**
- 구형 Android → **ETC2**
- 지원 없음 → **RGBA 폴백**

트랜스코딩은 Basis Universal의 WebAssembly 트랜스코더가 수행한다. "압축 → 다른 압축"으로의 변환이므로 빠르다.

## 운영 프로젝트 실측 결과

수천 개의 드론 촬영 텍스처 타일(10GB 이상 모델)에 JPEG → KTX2(ETC1S) 변환을 적용한 결과:

| 지표 | 변환 전 (JPEG) | 변환 후 (KTX2) | 개선 |
|------|--------------|--------------|------|
| 씬당 GPU 메모리 | 75 MB | 20 MB | **73%↓** |
| 모델 로드 메모리 | 1.3 GB | 0.4 GB | **69%↓** |
| GPU VRAM 점유 | 1.7 GB | 0.8 GB | **53%↓** |
| 화면 이동 시 메모리 변동폭 | 0.9 GB | 0.3 GB | **66% 안정화** |
| 초기 로드 시간 | 28초 | 20초 | **28%↓** |

메모리 변동폭이 안정화된 이유: GPU 압축 텍스처는 동일 해상도면 항상 같은 GPU 메모리를 차지한다. JPEG은 이미지마다 비압축 크기가 달라 변동이 크지만, KTX2는 일정하다.

변환 도구: **gltf-transform CLI** + **KTX-Software** (Khronos Group 공식). 변환 파이프라인의 상세는 aws-lambda-ec2 노드에서 다룬다.

## 이 경험에서 추출한 원칙

1. **병목이 "네트워크"가 아니라 "GPU 메모리"일 수 있다.** JPEG은 전송 크기가 작지만, GPU에서 비압축으로 부풀어 오른다.

2. **"하나의 파일로 모든 기기 대응"이 유지보수 비용을 결정한다.** 기기별로 다른 텍스처를 준비하면 저장 비용, 파이프라인 복잡도, 캐시 관리가 배로 늘어난다.

현재 프로젝트의 텍스처를 `gltf-transform inspect`로 분석해 보라. RGBA 비압축 텍스처가 있다면 KTX2 적용 대상이다.
