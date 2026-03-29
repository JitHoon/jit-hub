---
slug: "gpu-texture-formats"
title: "GPU 텍스처 BC7·ASTC·ETC2"
cluster: "graphics"
difficulty: "advanced"
prerequisites: []
relatedConcepts:
  - slug: "ktx2-basis-universal"
    relationship: "transcodedFrom"
childConcepts: []
tags: ["gpu", "texture", "bc7", "astc", "etc2", "vram", "compression", "webgl"]
---

# GPU 텍스처 BC7·ASTC·ETC2

## 한 줄 요약

GPU가 직접 읽을 수 있는 압축 텍스처 포맷들. 데스크탑에서는 BC7, 모바일에서는 ASTC, Android에서는 ETC2가 사용된다. JPEG과 달리 GPU 메모리에 압축 상태 그대로 올라가므로, 비압축 RGBA 대비 75%의 메모리를 절약한다.

---

## 왜 GPU 전용 포맷이 필요한가

웹에서 흔히 사용하는 이미지 포맷(JPEG, PNG, WebP)은 **저장과 전송을 위한 포맷**이다. 파일 크기를 줄이는 데 최적화되어 있지만, GPU는 이 포맷을 직접 읽지 못한다. GPU가 텍스처를 사용하려면 반드시 비압축 RGBA 비트맵으로 디코딩해야 한다.

GPU 텍스처 포맷(BC7, ASTC, ETC2 등)은 **GPU가 압축된 상태에서 직접 샘플링(읽기)할 수 있도록 설계된 포맷**이다. CPU에서 비압축으로 풀 필요 없이, 압축된 데이터를 GPU 메모리에 그대로 올리면 GPU가 렌더링 시 실시간으로 디코딩한다.

이 차이가 만드는 메모리 절감 효과는 극적이다. 2048×2048 텍스처 1장 기준:

| 포맷 | bpp (bits per pixel) | GPU 메모리 | RGBA 대비 |
|------|---------------------|-----------|----------|
| RGBA (비압축) | 32 | 16 MB | 기준 |
| BC7 | 8 | 4 MB | -75% |
| ASTC 4×4 | 8 | 4 MB | -75% |
| ETC2 RGBA | 8 | 4 MB | -75% |
| ETC2 RGB (알파 없음) | 4 | 2 MB | -87.5% |

BC7, ASTC 4×4, ETC2 RGBA는 모두 동일한 8 bpp이므로, **GPU 메모리 절감 효과는 플랫폼 간 동일**하다.

## 세 가지 주요 포맷

### BC7 (Block Compression 7) — 데스크탑

| 항목 | 내용 |
|------|------|
| 대상 | Windows, macOS, Linux 데스크탑 GPU |
| 지원 GPU | NVIDIA GeForce, AMD Radeon, Intel, Apple Silicon |
| 메모리 | 8 bpp (1 byte/pixel) |
| 품질 | BCn 포맷 중 최고 수준, 8가지 인코딩 모드 |
| 지원 시기 | 2010년~ (DirectX 11, OpenGL 4.2+) |

데스크탑 환경에서는 거의 100% BC7로 트랜스코딩된다. WebGL에서는 `WEBGL_compressed_texture_s3tc_srgb` extension을 통해 지원된다.

### ASTC (Adaptive Scalable Texture Compression) — 모바일 + 최신 데스크탑

| 항목 | 내용 |
|------|------|
| 대상 | 모바일 + 최신 데스크탑 |
| 지원 GPU | Apple A8+, Qualcomm Adreno 4xx+, ARM Mali-T760+, NVIDIA Maxwell+ |
| 메모리 | 블록 크기에 따라 0.89~8 bpp |
| 품질 | 블록 크기로 품질/용량 트레이드오프 조절 가능 |
| 지원 시기 | 모바일: 2014년~, 데스크탑: 2015년~ |

ASTC의 특징은 **블록 크기를 조절하여 압축률과 품질의 균형을 선택**할 수 있다는 것이다. 4×4 블록은 8 bpp(BC7과 동일), 12×12 블록은 0.89 bpp(매우 공격적 압축)까지 가능하다. Basis Universal은 ASTC 4×4(8 bpp)로 트랜스코딩한다.

### ETC2 (Ericsson Texture Compression 2) — Android

| 항목 | 내용 |
|------|------|
| 대상 | Android (OpenGL ES 3.0 필수 지원 포맷) |
| 메모리 | RGB 4 bpp / RGBA 8 bpp |
| 품질 | BC7, ASTC보다 약간 낮음 |
| 역할 | Android 표준 포맷, ASTC 미지원 기기의 폴백 |

ETC2는 Android에서 OpenGL ES 3.0이 필수 지원하는 포맷이므로, ASTC를 지원하지 않는 구형 Android 기기에서 폴백으로 사용된다. iOS 기기는 ETC2를 사용하지 않고 ASTC를 사용한다.

## 블록 압축의 원리

세 포맷 모두 **블록 단위 압축**이라는 공통 원리를 사용한다. 텍스처 전체를 한 번에 압축하는 것이 아니라, 4×4 픽셀(또는 다른 크기) 블록 단위로 나누어 각 블록을 독립적으로 압축한다.

이 방식의 장점은 **랜덤 액세스가 가능하다**는 것이다. GPU가 텍스처의 특정 위치를 읽을 때, 해당 위치가 속한 블록만 디코딩하면 된다. JPEG처럼 전체 이미지를 디코딩할 필요가 없다. 이것이 GPU가 압축 상태에서 실시간으로 텍스처를 샘플링할 수 있는 이유다.

단점은 **블록 경계에서 아티팩트가 발생할 수 있다**는 것이다. 인접한 블록이 독립적으로 압축되므로, 블록 경계에서 색상이 미세하게 불연속적으로 보일 수 있다. 다만 8 bpp 수준에서는 이 아티팩트가 거의 눈에 띄지 않는다.

## KTX2 Basis Universal과의 관계

BC7, ASTC, ETC2는 **최종 목적지**이고, KTX2 Basis Universal은 **거기까지 가는 경로**다.

```
서버: KTX2 (Basis Universal로 압축)
  ↓ 브라우저 다운로드
  ↓ GPU 지원 포맷 확인
  ├─ 데스크탑 → BC7로 트랜스코딩
  ├─ iPhone/iPad → ASTC로 트랜스코딩
  ├─ Android (최신) → ASTC로 트랜스코딩
  ├─ Android (구형) → ETC2로 트랜스코딩
  └─ 지원 없음 → RGBA 폴백
  ↓ GPU에 직접 업로드 (압축 상태 유지)
```

트랜스코딩은 Basis Universal의 WebAssembly 트랜스코더가 수행하며, "압축 → 다른 압축"으로의 변환이므로 비압축을 거치지 않아 빠르다. 이것이 KTX2의 핵심 설계 — **하나의 파일로 모든 플랫폼의 GPU에 최적화된 텍스처를 제공**한다.

## 이 경험에서 추출한 원칙

1. **"파일 크기"와 "GPU 메모리 크기"는 별개의 문제다.** JPEG은 파일이 작지만 GPU에서 크고, GPU 압축 포맷은 파일이 비슷하거나 더 클 수 있지만 GPU에서 작다. 최적화의 대상이 네트워크인지 GPU인지에 따라 전략이 달라진다.

2. **플랫폼 파편화를 런타임 트랜스코딩으로 해결할 수 있다.** BC7은 데스크탑에서만, ASTC는 모바일에서만 동작한다. 플랫폼마다 다른 파일을 준비하는 대신, Basis Universal이 런타임에 적절한 포맷으로 변환하여 "하나의 파일 → 모든 기기"를 실현한다.

---

## 연결된 노드

- **← KTX2 Basis Universal** (이 포맷들로 트랜스코딩하는 시스템)
