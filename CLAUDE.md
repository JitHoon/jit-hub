# 3D GIS 지식 포트폴리오

## Quick Facts

- **Stack**: Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind CSS
- **시각화**: react-force-graph-2d (dynamic import, ssr: false)
- **콘텐츠**: gray-matter + Zod + next-mdx-remote (커스텀 파이프라인)
- **배포**: Vercel Hobby (무료)
- **언어**: 한국어 우선 (MVP), 영어 이후 확장

## 핵심 명령어

- `bun run dev` — 개발 서버
- `bun run build` — 프로덕션 빌드 (graph-data.json 자동 생성 포함)
- `bun run lint` — ESLint + TypeScript 검사
- `bun run test` — 테스트 실행

## 아키텍처 핵심

- **단일 소스 원칙**: `contents/nodes/*.md` 프론트매터가 유일한 진실의 원천
- **graph-data.json**: 빌드 타임에 자동 생성 (.gitignore 대상)
- **싱글 페이지 분할 뷰**: 별도 상세 페이지 없음. 그래프(좌) + 본문(우) 나란히
- **SEO 이중 경로**: `/` (분할 뷰, ?node=slug) + `/nodes/[slug]` (SEO용 정적)

## 절대 규칙

- TypeScript `any` 사용 금지 → `unknown` 사용
- 새 노드 추가 = `.md` 파일 하나만 생성 (다른 파일 수정 불필요)
- 존재하지 않는 slug 참조 → 빌드 에러
- react-force-graph-2d는 반드시 `dynamic(() => import(...), { ssr: false })`
- 커밋 메시지는 conventional commits (feat:, fix:, refactor: 등)
- **요청 범위만 수행**: 사용자가 요청한 작업 항목만 완료하고 멈출 것. 완료 후 다음 항목으로 자의적으로 넘어가지 않는다.

## 조건부 컨텍스트

<important if="콘텐츠 파이프라인 작업 시">
@.claude/skills/content-pipeline/SKILL.md 를 읽어라
</important>

<important if="그래프 시각화 작업 시">
@.claude/skills/graph-visualization/SKILL.md 를 읽어라
</important>

<important if="Next.js 라우팅, 레이아웃, SSG 작업 시">
@.claude/skills/nextjs-patterns/SKILL.md 를 읽어라
</important>

<important if="새 Command, Agent, Skill, Hook을 만들거나 수정할 때">
@.claude/skills/harness-engineering/SKILL.md 를 읽어라
</important>

<important if="코드 작성, 컴포넌트 구현, 라이브러리 사용 시">
@.claude/skills/library-practices/SKILL.md 를 읽어라
</important>

<important if="기술 스택 변경, 아키텍처 재설계, 또는 과거 의사결정 맥락이 필요할 때">
@.claude/docs/project-blueprint-v2.md 를 읽어라 (v1→v2 변경 이력, 결정 근거 포함)
</important>

## 디렉토리 구조

- `contents/nodes/` — 지식 노드 마크다운 파일 (.md)
- `src/app/` — Next.js App Router 페이지
- `src/components/` — React 컴포넌트
- `src/lib/` — 유틸리티, 파이프라인, 타입 정의
- `src/lib/schema.ts` — Zod 스키마 (클러스터, difficulty enum 포함)
- `src/lib/pipeline.ts` — 빌드 타임 콘텐츠 처리
- `public/` — 정적 파일
