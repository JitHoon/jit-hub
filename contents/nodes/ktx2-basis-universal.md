---
slug: "ktx2-basis-universal"
title: "KTX2 Basis Universal"
cluster: "optimization"
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

GPU 텍스처를 담는 컨테이너 포맷(KTX2)과, 그 안에서 사용되는 중간 압축 방식(Basis Universal)의 조합. 서버에는 하나의 파일만 저장하면 되고, 클라이언트에서 기기의 GPU에 맞는 네이티브 포맷으로 자동 트랜스코딩된다.

## GPU는 JPEG을 직접 읽지 못한다

이 사실이 KTX2가 존재하는 근본적인 이유다.

웹에서 3D 모델의 텍스처를 표시할 때, 브라우저가 JPEG 파일을 받으면 다음 과정을 거친다:

1. JPEG을 CPU에서 디코딩하여 비압축 RGBA 비트맵으로 변환
2. 이 비압축 데이터를 GPU에 업로드

문제는 2번이다. 2048×2048 텍스처 1장을 비압축 RGBA로 GPU에 올리면 **16MB**를 차지한다. JPEG 파일 자체는 수백 KB에 불과하지만, GPU 메모리에서는 수십 배로 부풀어 오른다.

드론 촬영 기반의 Mesh 모델은 몇 천 장의 텍스처 타일을 가진다. 10GB 이상의 모델에서 텍스처 하나하나가 GPU에서 16MB씩 차지하면, GPU 메모리(VRAM)가 빠르게 소진된다.

## KTX2 + Basis Universal의 해결 방식

KTX2는 이 문제를 **"GPU가 직접 읽을 수 있는 압축 포맷으로 텍스처를 저장하고, 브라우저에서 기기에 맞는 포맷으로 트랜스코딩한다"**로 해결한다.

```
JPEG 방식:
  서버: JPEG (작음)
  → CPU: JPEG → RGBA 디코딩 (느림)
  → GPU: RGBA 16MB (비압축, 큼)

KTX2 방식:
  서버: KTX2 (JPEG과 비슷한 크기)
  → CPU: Basis → BC7/ASTC/ETC2 트랜스코딩 (빠름, WebAssembly)
  → GPU: 4MB (압축 상태 유지, 작음)
```

핵심 차이는 GPU에 올라가는 시점이다. JPEG은 비압축 상태로 올라가지만, KTX2는 **GPU 네이티브 압축 포맷 그대로** 올라간다. GPU가 압축된 상태에서 직접 텍스처를 샘플링(읽기)할 수 있으므로, 비압축으로 풀 필요가 없다.

결과적으로 2048×2048 텍스처 1장이 GPU에서 차지하는 메모리가 **16MB → 4MB로 75% 절감**된다.

## Basis Universal의 두 가지 모드

KTX2 안에서 사용되는 Basis Universal 압축에는 두 가지 모드가 있다:

### ETC1S — 용량 우선

| 항목 | 값 |
|------|---|
| GPU 메모리 | 4 bpp (bits per pixel) |
| 디스크 크기 | 0.3~1.25 bpp (BasisLZ Supercompression 후) |
| 품질 | 중~저 (항공/드론 촬영 사진에서는 충분) |
| 적합한 용도 | 대량의 타일, 항공/드론 포토 텍스처 |

### UASTC — 품질 우선

| 항목 | 값 |
|------|---|
| GPU 메모리 | 8 bpp |
| 디스크 크기 | 2~6 bpp (RDO + Zstandard 후) |
| 품질 | 높음 (BC7에 준하는 품질) |
| 적합한 용도 | 건축/제품 3D, 노멀맵, 고품질 필수 |

실무에서 ETC1S를 선택한 이유는, 몇 천 개의 드론 촬영 텍스처 타일에서 **용량 절감이 최우선**이었고, 항공 촬영 특성상 미세한 압축 아티팩트가 **육안으로 품질 저하가 눈에 띄지 않았기 때문**이다.

## 트랜스코딩: 하나의 파일로 모든 기기 대응

Basis Universal의 핵심 가치는 **"서버에 하나의 파일만 저장하면 된다"**는 것이다.

브라우저(CesiumJS)가 KTX2 파일을 로드하면, 먼저 WebGL extension을 확인하여 현재 기기의 GPU가 어떤 압축 포맷을 지원하는지 파악한다:

- `WEBGL_compressed_texture_s3tc_srgb` → **BC7** (데스크탑)
- `WEBGL_compressed_texture_astc` → **ASTC 4×4** (모바일/최신 데스크탑)
- `WEBGL_compressed_texture_etc` → **ETC2** (Android)
- `WEBGL_compressed_texture_pvrtc` → **PVRTC** (구형 iOS)
- 없음 → **RGBA 폴백** (어디서든 동작)

그 다음 Basis Universal 트랜스코더(WebAssembly)가 해당 포맷으로 변환하고, GPU에 직접 업로드한다.

기기별로 다른 텍스처 파일을 준비할 필요가 없다. KTX2 파일 하나가 데스크탑에서는 BC7로, 아이폰에서는 ASTC로, 안드로이드에서는 ETC2로 자동 트랜스코딩된다. 3D Tiles를 볼 수 있는 환경이라면 KTX2도 반드시 동작한다.

## 실무 적용 결과

몇 천 개의 드론 촬영 텍스처 타일(10GB 이상 모델)에 JPEG → KTX2(ETC1S) 변환을 적용한 결과:

| 지표 | 변환 전 (JPEG) | 변환 후 (KTX2) | 개선 |
|------|--------------|--------------|------|
| 모델 로드 메모리 | 1.3 GB | 0.4 GB | 69%↓ |
| GPU VRAM 점유 | 1.7 GB | 0.8 GB | 53%↓ |
| 화면 이동 시 메모리 변동폭 | 0.9 GB | 0.3 GB | 66% 안정화 |
| 초기 로드 GPU 소요 시간 | 28초 | 20초 | 28%↓ |

메모리 변동폭이 안정화된 이유는, GPU 압축 텍스처는 타일 로드/언로드 시 메모리 할당 크기가 일정하기 때문이다. JPEG은 이미지마다 비압축 크기가 달라 변동이 크지만, KTX2는 동일 해상도면 항상 같은 GPU 메모리를 차지한다.

변환 도구로는 **gltf-transform CLI**와 **KTX-Software**를 사용했다. gltf-transform은 glTF/glb 파일의 텍스처를 KTX2로 변환하는 기능을 제공하며, KTX-Software는 Khronos Group이 관리하는 공식 KTX2 인코더/디코더다.

## 이 경험에서 추출한 원칙

1. **병목이 "네트워크"가 아니라 "GPU 메모리"일 수 있다.** JPEG은 전송 크기가 작지만, GPU에서 비압축으로 부풀어 오른다. 성능 최적화의 대상이 항상 파일 크기나 네트워크 속도인 것은 아니다 — GPU 메모리가 진짜 병목일 수 있다.

2. **"하나의 파일로 모든 기기 대응"이 유지보수 비용을 결정한다.** 기기별로 다른 텍스처를 준비하면 저장 비용, 변환 파이프라인 복잡도, 캐시 관리가 모두 배로 늘어난다. KTX2 + Basis Universal의 런타임 트랜스코딩 방식은 서버 측 복잡도를 최소화한다.
