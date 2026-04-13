# LLM Wiki 패턴 기반 지식 그래프 재구조화 계획 v2

> **이 문서를 CLAUDE.md와 함께 읽고 작업을 진행하라.**
> 작성일: 2026-04-11
> 목적: Karpathy의 LLM Wiki 패턴을 JIT-Hub에 적용. 콘텐츠와 지식 구조를 완전히 재구조화하고, UI/시각화 코드만 유지.

---

## 1. 배경

### Karpathy LLM Wiki 패턴 원본 요약

출처: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

**핵심 원리**: RAG(매 질문마다 원본 재검색)가 아닌, 소스를 한 번 "컴파일"하여 구조화된 위키로 만든다. 지식이 복리로 축적된다.

**3계층 아키텍처**:

```
raw/     — 불변 원본 소스 (append-only, LLM은 읽기만)
wiki/    — LLM이 작성·유지하는 마크다운 위키 (인간은 읽기만)
outputs/ — 질의 응답, 보고서 (선택적)
```

**3가지 운영 명령** (Karpathy 원본 그대로):

| 명령 | Karpathy 원본 설명 |
|------|-------------------|
| **ingest** | raw/에 새 소스가 들어오면: (1) wiki/INDEX.md를 읽어 기존 글 파악 (2) 새 소스에서 새 개념 식별 (3) wiki/에 글 생성 또는 기존 글 업데이트 (4) 관련 글에 backlink 추가 (5) INDEX.md 갱신 |
| **query** | (1) wiki/INDEX.md를 읽는다 (2) 관련 글을 식별하여 읽는다 (3) 답변을 outputs/YYYY-MM-DD-query-slug.md에 작성한다 |
| **lint** | (1) 모든 wiki 글을 읽는다 (2) 모순, 누락된 backlink, 언급되지만 글이 없는 개념을 감지한다 (3) 누락된 글의 stub을 생성한다 |

**위키 페이지 형식** (Karpathy 원본): Karpathy는 엄격한 페이지 템플릿을 규정하지 않는다. LLM이 "encyclopedia-style articles"를 자유롭게 작성하되, 다음을 지킨다:
- 개념당 하나의 .md 파일
- `[[wiki-links]]` 형태의 backlink로 글 간 연결
- INDEX.md에 한 줄 요약으로 등록

**스키마 파일(CLAUDE.md)의 역할**: LLM의 행동 규칙을 정의. 소스 유형별 ingest 방법, INDEX 형식, backlink 규칙, lint 검사 항목 등을 명시. 인간의 주요 역할은 글을 직접 쓰는 것이 아니라 이 스키마를 다듬는 것.

### 이 프로젝트에 적용할 때의 차이

| Karpathy 원본 | JIT-Hub 적용 |
|---------------|-------------|
| 비공개 개인 위키 | **공개 포트폴리오** (SEO 포함) |
| `wiki/` 폴더 | `contents/nodes/` 폴더 (기존 빌드 파이프라인 유지) |
| Obsidian 그래프 뷰 | **react-force-graph-3d** (3D 시각화, 유지) |
| `[[wiki-links]]` | 프론트매터 관계 + 본문 내 링크 (MDX 렌더링 호환) |
| `INDEX.md` (수동) | `graph-data.json` (빌드 타임 자동 생성) |
| `outputs/` 폴더 | 선택적 (필요 시 추가) |
| 자유로운 분류 | 프론트매터 스키마로 구조화 (그래프 시각화를 위해 필요) |

---

## 2. 목표

### 무엇을 바꾸는가

- **콘텐츠**: 기존 21개 노드를 raw 소스에서 **완전히 새로 컴파일**. 기존 본문을 보존하지 않고, raw를 기반으로 LLM이 Karpathy 패턴으로 재작성.
- **지식 구조**: 9개 고정 클러스터 → LLM이 raw 분석 후 자연스럽게 도출하는 분류 체계. 단, 그래프 시각화를 위해 프론트매터 스키마는 유지.
- **운영 프로세스**: Karpathy의 ingest/query/lint 명령을 하네스에 통합.

### 무엇을 유지하는가

- **UI/시각화 코드**: react-force-graph-3d, 3D 그래프, SiteHeader, ContentSection, ConnectionTree 등 모든 UI 컴포넌트 코드 유지.
- **빌드 파이프라인**: gray-matter + Zod + next-mdx-remote. 프론트매터 스키마는 새 분류 체계에 맞게 수정하되 파이프라인 자체는 유지.
- **SEO 이중 경로**: `/` + `/nodes/[slug]`.
- **하네스 구조**: Command → Agent → Skill 패턴.
- **디자인 시스템**: 토큰, 색상 (새 분류에 맞게 색상 매핑만 조정).

---

## 3. Karpathy 원본 스키마 (CLAUDE.md에 통합할 내용)

아래는 Karpathy gist에서 제시한 스키마 파일의 구조를 이 프로젝트에 맞게 번역한 것이다. 가능한 한 원본의 구조와 규칙을 그대로 따른다.

```markdown
# Knowledge Base Schema (Karpathy 패턴 기반)

## Directories
- raw/: 원본 소스. Append-only. 절대 수정하지 않는다. 이것이 진실의 원천.
- contents/nodes/: LLM이 작성·유지하는 위키 글. 개념당 하나의 .md 파일.
- outputs/: 질의 응답, 보고서 (선택적).

## On ingesting a new source in raw/ (ingest):
1. 기존 contents/nodes/의 모든 프론트매터를 읽어 현재 글 목록을 파악한다.
2. 새 소스에서 기존에 없는 개념을 식별한다.
3. 새 개념마다 contents/nodes/에 .md 파일을 생성한다.
4. 새 소스가 기존 글과 관련되면, 기존 글도 업데이트한다.
5. 프론트매터의 관계 필드(prerequisites, relatedConcepts, childConcepts)를 갱신한다.
6. graph-data.json은 빌드 시 자동 생성되므로 직접 수정하지 않는다.

## On answering a query (query):
1. contents/nodes/의 모든 프론트매터를 읽어 관련 글을 식별한다.
2. 관련 글의 본문을 읽는다.
3. 답변을 생성한다 (outputs/에 저장하거나 직접 응답).

## On a linting pass (lint):
1. contents/nodes/의 모든 글을 읽는다.
2. 다음을 감지한다:
   - 글 간 모순되는 주장
   - 누락된 backlink (A가 B를 언급하지만 B의 관계에 A가 없음)
   - 본문에서 언급되지만 독립 글이 없는 개념
   - 고아 글 (아무 글에서도 참조하지 않는 글)
   - 프론트매터에 존재하지 않는 slug 참조
3. 누락된 글의 stub을 제안한다.
4. 결과를 리포트로 출력한다.
```

---

## 4. 작업 Phase

### Phase 0: raw 수집 및 지식 맵 도출

**사용자가 raw/ 준비 완료 후 시작.**

LLM이 할 일:
1. `raw/` 폴더의 모든 파일을 읽는다.
2. **지식 맵 초안**을 작성한다:
   - 어떤 주제/개념들이 존재하는가
   - 주제 간 관계는 어떠한가
   - 최적의 분류 체계(domain/topic)는 무엇인가 — 사전에 고정하지 않고, raw 내용에서 자연스럽게 도출
   - 몇 개의 노드로 분해하는 것이 적절한가
   - 누락된 개념(여러 소스에서 언급되지만 독립 주제로 다뤄지지 않은 것)은 무엇인가
3. 지식 맵 초안을 **사용자에게 보여주고 확인 받는다**.
4. 사용자 피드백을 반영하여 최종 지식 맵을 확정한다.

### Phase 1: 스키마 적응

지식 맵이 확정되면:
1. **프론트매터 스키마 수정** — `src/features/content/types/schema.ts`
   - 새 분류 체계에 맞게 Zod 스키마 수정 (domain/topic 또는 확정된 구조)
   - 기존 `cluster` 필드명을 유지할지 변경할지는 Phase 0 결과에 따라 결정
2. **도메인/클러스터 상수 수정** — `src/constants/cluster.ts`
   - 새 분류에 맞게 ID, 라벨, 색상 재정의
3. **그래프 빌더 수정** — `src/features/graph/utils/builder.ts`, `src/lib/generate-graph-data.ts`
4. **타입 수정** — `src/types/graph.ts`, `src/types/node.ts`
5. 빌드 검증 요청 (사용자에게 `bun run build` 요청)

### Phase 2: 콘텐츠 컴파일 (Karpathy 패턴의 핵심)

**raw 소스를 기반으로 모든 노드를 LLM이 새로 작성한다.** 기존 `contents/nodes/*.md`의 본문을 보존하지 않는다.

1. raw/ 파일들을 하나씩 또는 묶어서 **ingest** 한다:
   - 각 raw 소스를 읽고 핵심 개념을 추출
   - 개념당 하나의 .md 파일을 `contents/nodes/`에 생성
   - 프론트매터는 Phase 1에서 확정된 스키마를 따름
   - 본문은 LLM이 encyclopedia-style로 작성 (Karpathy 패턴)
   - 관련 글 간 교차 참조를 프론트매터에 반영
2. 모든 ingest 완료 후 **lint** 실행:
   - 모순 감지
   - 누락 개념 식별 및 stub 생성
   - 양방향 참조 일관성 검증
3. 빌드 검증 요청

### Phase 3: 시각화 적응

UI 코드를 새 분류 체계에 맞게 **최소한으로** 수정:
1. `src/constants/cluster.ts` — 새 도메인/클러스터 ID·라벨·색상 (Phase 1에서 이미 수정됨)
2. `src/features/graph/hooks/useGraph3DRenderer.ts` — 색상 매핑이 새 상수를 참조하도록 (기존 렌더링 로직은 유지)
3. `src/features/content/components/ConnectionTree.tsx` — 새 관계 체계에 맞는 라벨 수정
4. `src/features/content/utils/edge-type.ts` — 엣지 타입 라벨/순서 수정 (필요 시)
5. 빌드·E2E 테스트 통과 확인

### Phase 4: 운영 명령 구축

Karpathy 원본의 3가지 명령을 하네스에 통합:

#### `/ingest <파일명>` — Karpathy의 ingest 그대로

```markdown
# .claude/commands/ingest.md
---
description: raw/의 소스를 읽고 wiki(contents/nodes/)를 업데이트합니다
argument-hint: "<raw 폴더 내 파일 경로>"
---

wiki-compiler 에이전트를 사용하여 다음 소스를 ingest하라: $ARGUMENTS
```

에이전트가 수행할 작업 (Karpathy 원본과 동일):
1. `contents/nodes/`의 모든 프론트매터를 읽어 기존 글 목록 파악
2. 새 소스에서 기존에 없는 개념 식별
3. 새 개념마다 `contents/nodes/`에 .md 생성
4. 기존 관련 글 업데이트
5. 프론트매터 관계 필드 갱신

#### `/lint-wiki` — Karpathy의 lint 그대로

```markdown
# .claude/commands/lint-wiki.md
---
description: 위키 건강 점검 — 모순, 고아 페이지, 누락 개념 감지
---

wiki-linter 에이전트를 사용하여 위키 건강 점검을 수행하라.
```

에이전트가 수행할 작업 (Karpathy 원본과 동일):
1. 모든 wiki 글 읽기
2. 모순되는 주장 감지
3. 누락된 backlink 감지 (A→B 참조 시 B→A도 있어야 함)
4. 언급되지만 글이 없는 개념 리스트
5. 고아 글 식별
6. 누락 글의 stub 생성 제안
7. 결과 리포트 출력

#### `/query <질문>` — Karpathy의 query 그대로

```markdown
# .claude/commands/query.md
---
description: 위키 전체를 기반으로 질문에 답변합니다
argument-hint: "<질문>"
---

wiki-reader 에이전트를 사용하여 다음 질문에 답변하라: $ARGUMENTS
```

에이전트가 수행할 작업 (Karpathy 원본과 동일):
1. `contents/nodes/`의 모든 프론트매터(INDEX 역할)를 읽어 관련 글 식별
2. 관련 글 본문 읽기
3. 답변 생성 (outputs/에 저장하거나 직접 응답)

---

## 5. 사용자가 준비할 자료

### 필수

#### 5-1. raw/ 폴더 구성

기존 노드를 작성할 때 사용한 원본 자료가 있으면 그것을 넣는다. 없으면 기존 `contents/nodes/*.md` 자체를 raw로 사용한다:

```bash
mkdir -p raw/existing-nodes
cp contents/nodes/*.md raw/existing-nodes/
```

추가하고 싶은 새 주제가 있으면:

```bash
mkdir -p raw/new-topics
# 여기에 새 소스 파일 배치
```

#### 5-2. `raw/my-preferences.md` 작성

```markdown
# 지식 분류 선호도

## 1. 이 포트폴리오의 주요 독자는?
(예: 프론트엔드 채용 담당자, 3D GIS 동료 개발자, 기술 블로그 독자 등)

## 2. 어떤 인상을 주고 싶은가?
(예: "3D GIS 전문가", "엔지니어링 깊이가 있는 프론트엔드 개발자" 등)

## 3. 현재 9개 클러스터 중 불만족스러운 분류는?

## 4. 앞으로 추가하고 싶은 지식 영역은?
(예: AI/LLM, 하네스 엔지니어링, 웹 성능 최적화 등)

## 5. 기존 노드 중 가장 잘 쓴 것과 아쉬운 것은?

## 6. 콘텐츠 수정 범위 확인
→ "raw를 기반으로 LLM이 완전히 새로 작성해도 OK" (이미 확인됨)
```

### 선택

- `raw/references/` — 참고 외부 문서, 아티클
- `raw/code-snippets/` — 실무 핵심 코드 스니펫
- `raw/diagrams/` — 아키텍처 다이어그램

---

## 6. 작업 규칙

### 절대 규칙

1. **UI/시각화 코드를 새로 구현하지 않는다** — 기존 react-force-graph-3d, 컴포넌트들의 구현 코드를 유지. 새 분류에 맞게 상수/매핑만 수정.
2. **빌드 파이프라인을 유지한다** — gray-matter + Zod + next-mdx-remote.
3. **SEO 이중 경로를 유지한다** — `/` + `/nodes/[slug]`.
4. **한 Phase씩 순차 진행** — Phase 0 완료 후 사용자 확인 → Phase 1.
5. **빌드/dev 서버 실행은 사용자에게 요청한다**.
6. **ingest/lint/query 명령은 Karpathy 원본의 동작을 그대로 따른다**.
7. **raw/는 .gitignore에 추가한다** (원본 소스는 비공개).
8. **기존 URL 경로(`/nodes/[slug]`)가 깨지지 않도록 한다** — slug 변경 시 사용자에게 확인.

---

## 7. 시작 방법

```
사용자: "이 문서를 읽고 Phase 0을 시작해줘. raw/ 폴더를 분석해줘."
```

---

## 8. 수정 대상 파일 요약

### 스키마 & 데이터 (Phase 1)
- `src/features/content/types/schema.ts`
- `src/constants/cluster.ts`
- `src/lib/generate-graph-data.ts`
- `src/features/graph/utils/builder.ts`
- `src/types/graph.ts`, `src/types/node.ts`

### 콘텐츠 (Phase 2)
- `contents/nodes/*.md` — 전체 삭제 후 재생성

### 시각화 적응 (Phase 3, 최소 수정)
- `src/features/graph/hooks/useGraph3DRenderer.ts` — 색상 매핑만
- `src/features/content/components/ConnectionTree.tsx` — 라벨만
- `src/features/content/utils/edge-type.ts` — 라벨/순서만
- `src/features/content/utils/connected-nodes.ts` — 필요 시

### 하네스 (Phase 4)
- `.claude/commands/ingest.md` — 새로 생성
- `.claude/commands/lint-wiki.md` — 새로 생성
- `.claude/commands/query.md` — 새로 생성
- `.claude/agents/wiki-compiler.md` — 새로 생성
- `.claude/agents/wiki-linter.md` — 새로 생성
- `.claude/agents/wiki-reader.md` — 새로 생성
- `.claude/skills/content-pipeline/SKILL.md` — 업데이트