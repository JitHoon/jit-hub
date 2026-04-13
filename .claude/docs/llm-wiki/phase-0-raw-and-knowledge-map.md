# Phase 0: raw 수집 + 지식 맵 도출

> **선행 조건**: 없음 (첫 Phase)
> **완료 조건**: knowledge-map.json 사용자 승인
> **참조**: GUIDE.md, `.claude/docs/planning/llm-wiki-migration.md` §4 Phase 0

---

## TODO 0-1: raw/ 디렉토리 생성

### 작업 내용
1. `contents/raw/existing-nodes/` 디렉토리 생성
2. `contents/nodes/*.md` 21개 파일을 `contents/raw/existing-nodes/`로 복사
3. `.gitignore`에 `contents/raw/` 추가

### 실행 명령
```bash
mkdir -p contents/raw/existing-nodes
cp contents/nodes/*.md contents/raw/existing-nodes/
echo "contents/raw/" >> .gitignore
```

### 주의사항
- `contents/nodes/`의 원본은 수정하지 않는다
- raw/는 append-only — 이후 Phase에서도 절대 수정 안 함

---

## TODO 0-2: 사용자 `raw/my-preferences.md` 작성

### 사용자가 직접 작성해야 하는 파일

`contents/raw/my-preferences.md`:

```markdown
# 지식 분류 선호도

## 1. 이 포트폴리오의 주요 독자는?
(예: 프론트엔드 채용 담당자, 3D GIS 동료 개발자, 기술 블로그 독자 등)

## 2. 어떤 인상을 주고 싶은가?
(예: "3D GIS 전문가", "엔지니어링 깊이가 있는 프론트엔드 개발자" 등)

## 3. 현재 9개 클러스터 중 불만족스러운 분류는?
(현재: 측지·좌표계, 3D 그래픽스, 구현 사례, 문제 해결, 최적화, 인프라·배포, 프론트엔드, 데이터 포맷, 의사결정)

## 4. 앞으로 추가하고 싶은 지식 영역은?
(예: AI/LLM, 하네스 엔지니어링, 웹 성능 최적화 등)

## 5. 기존 노드 중 가장 잘 쓴 것과 아쉬운 것은?

## 6. 새 소스 자료 추가 여부
→ contents/raw/new-topics/에 추가할 자료가 있는가?
```

### 왜 필요한가
LLM이 분류 체계를 도출할 때 사용자의 의도와 독자 페르소나를 반영해야 한다.
이 파일 없이 진행하면 기술 중심 분류가 되어 포트폴리오 목적에서 벗어날 수 있다.

---

## TODO 0-3: LLM 분류 체계 분석

### 작업 내용
1. `contents/raw/existing-nodes/*.md` 21개 파일 전부 읽기 (프론트매터 + 본문)
2. `contents/raw/my-preferences.md` 읽기
3. 분석:
   - 어떤 주제/개념이 존재하는가
   - 주제 간 자연스러운 관계
   - 최적의 클러스터 분류 (5~12개 권장)
   - 기존 분류와 비교한 변경 사항
   - 누락된 개념 (여러 소스에서 언급되지만 독립 노드가 없는 것)
4. `.claude/docs/llm-wiki/knowledge-map.json` 작성

### knowledge-map.json 스키마

```json
{
  "clusters": [
    {
      "id": "kebab-case-id",
      "label": "한국어 라벨",
      "color": "#HEX",
      "kickBase": "red|blue|green|yellow",
      "description": "이 클러스터가 담는 주제 범위"
    }
  ],
  "nodeAssignments": [
    {
      "slug": "existing-slug",
      "newCluster": "cluster-id",
      "rationale": "이 클러스터에 배정한 이유"
    }
  ],
  "newNodes": [
    {
      "slug": "proposed-slug",
      "title": "제안 제목",
      "cluster": "cluster-id",
      "rationale": "이 노드가 필요한 이유"
    }
  ],
  "removedNodes": [],
  "rationale": "전체 분류 체계 설계 근거"
}
```

### 읽어야 하는 파일
- `contents/raw/existing-nodes/*.md` — 21개 전부
- `contents/raw/my-preferences.md` — 사용자 선호
- `src/constants/cluster.ts` — 현재 9개 클러스터 정의 (비교용)

### 현재 9개 클러스터 (참고)
| ID | 한국어 라벨 | 색상 | KickBase |
|---|---|---|---|
| geodesy | 측지·좌표계 | #00A651 | green |
| graphics | 3D 그래픽스 | #0058A6 | blue |
| implementation | 구현 사례 | #E60012 | red |
| problem | 문제 해결 | #B80030 | red |
| optimization | 최적화 | #FFC800 | yellow |
| infrastructure | 인프라·배포 | #2B7CB6 | blue |
| frontend | 프론트엔드 | #D45800 | red |
| format | 데이터 포맷 | #007A4D | green |
| decision | 의사결정 | #E0A500 | yellow |

### 클러스터 설계 제약
- kickBase는 반드시 4색 중 하나: `"red" | "blue" | "green" | "yellow"`
- 클러스터 ID는 kebab-case
- 그래프 시각화에서 색상 대비가 충분해야 함 (인접 클러스터끼리 같은 kickBase 피할 것)

---

## TODO 0-4: Slug 안정성 감사

### 작업 내용
1. knowledge-map.json의 nodeAssignments와 newNodes 읽기
2. 기존 21개 slug 중 변경이 필요한 것 식별
3. `.claude/docs/llm-wiki/slug-audit.md` 작성

### slug-audit.md 포맷
```markdown
# Slug 안정성 감사

## 유지되는 slug (21개 중 N개)
| slug | 이유 |
|------|------|
| 3d-tiles-spec | 변경 불필요 |
| ... | ... |

## 변경이 필요한 slug
| 기존 slug | 새 slug | 이유 | 리다이렉트 필요 |
|-----------|---------|------|----------------|
| (없으면 비움) | | | |

## 새로 추가되는 slug
| slug | 클러스터 | 이유 |
|------|---------|------|
| (knowledge-map.json의 newNodes에서) | | |
```

### 왜 중요한가
- `/nodes/[slug]` SEO 경로가 깨지면 검색 엔진 순위에 영향
- `generateStaticParams()`가 파일명에서 slug 도출 (`src/app/nodes/[slug]/page.tsx`)
- 다른 노드의 프론트매터에서 slug를 참조하므로 한 곳 변경 시 연쇄 수정 필요

### 기본 원칙
**slug는 가능한 한 유지한다.** 정말 필요한 경우에만 변경하고, 사용자에게 명시적으로 확인 받는다.

---

## 현재 21개 노드 목록 (참고)

```
3d-tiles-spec, area-calculation, aws-lambda-ec2, cesium-adoption,
cesium-mouse-events, chrome-devtools-memory, coordinate-transform,
docker-container, draco-compression, fbxloader-memory-leak,
geoid-correction, gpu-texture-formats, ifc-3dtiles-pipeline,
ktx2-basis-universal, lod, measurement-tools, meridian-convergence,
mesh-bim-pointcloud, model-matrix, optimistic-update, spatial-partitioning
```
