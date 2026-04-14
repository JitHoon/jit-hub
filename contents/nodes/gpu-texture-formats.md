---
slug: "gpu-texture-formats"
title: "GPU가 JPEG를 직접 읽지 못하는 이유와 블록 압축 포맷"
cluster: "performance"
difficulty: "advanced"
prerequisites: []
relatedConcepts:
  - slug: "ktx2-basis-universal"
    relationship: "prerequisite"
childConcepts: []
tags: ["gpu", "texture", "bc7", "astc", "etc2", "vram", "compression", "webgl"]
---

# GPU가 JPEG를 직접 읽지 못하는 이유와 블록 압축 포맷

## 한 줄 요약

텍스처가 JPEG로 저장되어 있으면, GPU가 이를 읽기 위해 메모리에서 RGBA로 디코딩해야 한다. 2048×2048 텍스처 하나가 16MB의 GPU 메모리를 점유한다. GPU 블록 압축 포맷(BC7, ASTC, ETC2)을 사용하면 압축 상태 그대로 GPU에 올라가므로 동일 텍스처가 4MB만 차지한다.

## 텍스처 10장이면 그것만으로 160MB

3D 뷰어에서 텍스처가 많은 모델을 열 때마다 GPU 메모리가 급증했다. 원인을 추적한 결과, JPEG 텍스처가 GPU에 올라갈 때 비압축 RGBA로 디코딩되는 과정에서 메모리가 부풀어 오르고 있었다.

2048×2048 텍스처 1장이 비압축 RGBA로 GPU에 올라가면 **16MB**를 차지한다. JPEG 파일 자체는 수백 KB에 불과하지만, GPU 메모리에서는 수십 배로 부풀어 오른다. 모델에 텍스처가 10장이면 그것만으로 160MB다. 드론 촬영 기반 Mesh 모델은 수천 장의 텍스처 타일을 가진다.

이 문제의 해결이 ktx2-basis-universal 노드에서 다루는 KTX2 도입으로 이어졌다.

## GPU 전용 포맷의 원리: 블록 단위 압축

GPU 텍스처 포맷(BC7, ASTC, ETC2)은 **GPU가 압축된 상태에서 직접 샘플링(읽기)할 수 있도록 설계된 포맷**이다.

세 포맷 모두 **블록 단위 압축**이라는 공통 원리를 사용한다. 텍스처를 4×4 픽셀 블록 단위로 나누어 각 블록을 독립적으로 압축한다. 이 방식의 장점은 **랜덤 액세스가 가능하다**는 것이다. GPU가 특정 위치를 읽을 때 해당 블록만 디코딩하면 된다. JPEG처럼 전체 이미지를 디코딩할 필요가 없다 (Khronos glTF 2.0 Specification, KTX Artist Guide 참고).

| 포맷 | bpp | GPU 메모리 (2048×2048) | RGBA 대비 | 플랫폼 |
|------|-----|----------------------|----------|--------|
| RGBA (비압축) | 32 | 16 MB | 기준 | 전체 |
| BC7 | 8 | 4 MB | **-75%** | 데스크탑 |
| ASTC 4×4 | 8 | 4 MB | **-75%** | 모바일 + 최신 데스크탑 |
| ETC2 RGBA | 8 | 4 MB | **-75%** | Android |

## 세 가지 주요 포맷

**BC7 (Block Compression 7)** — 데스크탑 표준. Windows, macOS, Linux의 거의 100% GPU에서 지원. WebGL에서는 `WEBGL_compressed_texture_s3tc_srgb` extension을 통해 사용된다. BCn 포맷 중 최고 품질.

**ASTC (Adaptive Scalable Texture Compression)** — 모바일 + 최신 데스크탑. Apple A8+, Qualcomm Adreno 4xx+ 지원. 블록 크기를 4×4부터 12×12까지 조절하여 품질/용량 트레이드오프를 선택할 수 있다.

**ETC2 (Ericsson Texture Compression 2)** — Android 표준. OpenGL ES 3.0 필수 지원 포맷이므로 ASTC 미지원 구형 Android 기기의 폴백으로 사용된다.

## 실제 서비스에서의 트랜스코딩

드론 촬영 기반 Mesh 모델 서비스에서는 대부분의 사용자가 데스크탑 브라우저로 접근한다. 따라서 **BC7이 가장 많이 트랜스코딩되는 포맷**이다. 모바일 접근은 전체의 약 10% 미만이며, 이 경우 ASTC로 트랜스코딩된다.

KTX2 + Basis Universal을 사용하면 서버에 하나의 파일만 저장하고, 클라이언트에서 기기의 GPU에 맞는 포맷으로 자동 트랜스코딩된다. 이 과정의 상세는 ktx2-basis-universal 노드에서 다룬다.

## 이 경험에서 추출한 원칙

1. **"파일 크기"와 "GPU 메모리 크기"는 별개의 문제다.** JPEG은 파일이 작지만 GPU에서 크고, GPU 압축 포맷은 파일이 비슷하거나 더 클 수 있지만 GPU에서 작다.

2. **플랫폼 파편화를 런타임 트랜스코딩으로 해결할 수 있다.** BC7은 데스크탑에서만, ASTC는 모바일에서만 동작한다. Basis Universal이 런타임에 적절한 포맷으로 변환하여 "하나의 파일 → 모든 기기"를 실현한다.

현재 프로젝트에서 3D 모델의 텍스처가 JPEG/PNG로 저장되어 있다면, GPU 메모리 사용량을 Chrome DevTools Performance 탭에서 확인해 보라. 비압축 텍스처가 VRAM을 얼마나 차지하는지 파악하는 것이 최적화의 첫 걸음이다.
