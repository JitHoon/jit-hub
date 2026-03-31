---
name: content-pipeline
description: 콘텐츠 파이프라인 작업 시 사용. 마크다운 파일 추가, 프론트매터 스키마 수정, Zod 검증, graph-data.json 자동 생성, MDX 렌더링 관련 작업에 활성화.
allowed-tools: Read, Grep, Glob, Bash(bun:*)
---

# 콘텐츠 파이프라인 Skill

## 핵심 원칙

- `content/nodes/*.md`의 프론트매터가 단일 소스
- graph-data.json은 빌드 타임 자동 생성 → 절대 수동 편집 금지
- 새 노드 = .md 파일 하나만 생성

## 데이터 흐름

```
content/nodes/*.md (프론트매터 + MDX 본문)
        │
        ▼
  gray-matter: 프론트매터/본문 분리
        │
        ▼
  Zod 스키마: 프론트매터 검증 (src/lib/content/schema.ts)
        │
        ├──▶ 프론트매터 → graph-data.json 자동 생성
        │      (nodes[], edges[], clusters[])
        │      .gitignore 대상
        │
        └──▶ MDX 본문 → remark/rehype → next-mdx-remote 렌더링
                         → 커스텀 컴포넌트 삽입 가능
```

## 프론트매터 스키마

```yaml
slug: "node-slug" # URL, 파일명, 그래프 ID
title: "노드 제목"
cluster: "geodesy" # 9개 클러스터 중 하나
difficulty: "intermediate" # beginner | intermediate | advanced | expert
prerequisites: # 선행 노드
  - "prerequisite-slug"
relatedConcepts: # 관련 노드 + 관계
  - slug: "related-slug"
    relationship: "appliedIn"
childConcepts: # 하위 개념
  - "child-slug"
tags: ["tag1", "tag2"]
```

필수: slug, title, cluster, difficulty, tags
선택: prerequisites, relatedConcepts, childConcepts

## Zod 스키마 위치

`src/lib/content/schema.ts`에서 관리. 클러스터 정의는 `src/lib/common/cluster.ts`.

클러스터 목록:
geodesy, graphics, implementation, problem, optimization,
infrastructure, frontend, format, decision

difficulty: beginner | intermediate | advanced | expert

## 빌드 타임 검증

1. prerequisites/relatedConcepts/childConcepts의 slug가 실제 노드로 존재하는지
2. slug 중복 없는지
3. 필수 필드 누락 없는지
   → 실패 시 빌드 에러

## 관계 데이터 모델

- 데이터 레벨 (프론트매터): 관계 유형을 제한 없이 자유 사용
- 새 노드 추가 시 새 관계 유형 생성 가능
- 시각 레벨 매핑은 graph-visualization Skill 참조
- 본문 패널에서는 원래 관계 유형을 텍스트로 표시

## 노드 추가 절차

1. `content/nodes/{slug}.md` 생성
2. 프론트매터 작성 (위 스키마 준수)
3. MDX 본문 작성
4. `bun run build`로 검증 실행
5. 빌드 성공 확인 후 커밋

## Gotchas

- relatedConcepts의 slug 오타 → 빌드 에러 (의도된 동작)
- gray-matter는 YAML 파싱. `---` 구분자 정확히 사용. 프론트매터는 반드시 파일 첫 줄에서 시작
- next-mdx-remote: `next-mdx-remote/rsc` import 사용 (RSC 전용, serialize 불필요)
- next-mdx-remote: MDXProvider 컨텍스트 사용 불가 → components prop 직접 전달
- next-mdx-remote: `<MDXRemote>`는 async Server Component → 클라이언트 컴포넌트에서 사용 불가
- **Turbopack 필수**: next.config에 `transpilePackages: ['next-mdx-remote']` 추가
- rehype-pretty-code: CSS 미포함 — `globals.css`에 스타일 정의 필요
- remark-gfm: ESM-only (`require()` 불가)
- Zod v3 사용 (`import { z } from 'zod'`). v4 아님
