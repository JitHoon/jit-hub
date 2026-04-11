---
name: 빌드/dev 실행 금지
description: bun run build, bun run dev 등 빌드/개발 서버 실행은 사용자에게 요청할 것
type: feedback
---

빌드(`bun run build`)와 개발 서버(`bun run dev`) 실행은 직접 하지 말고 사용자에게 요청할 것.

**Why:** 사용자가 직접 빌드/dev를 관리하고 싶어함. 빌드 락 충돌 등 문제 방지.

**How to apply:** 코드 변경 후 빌드 검증이 필요하면 "빌드 한번 돌려주시겠어요?" 식으로 요청. `bun run build`, `bun run dev`, `next build`, `next dev` 등 직접 실행하지 않는다.
