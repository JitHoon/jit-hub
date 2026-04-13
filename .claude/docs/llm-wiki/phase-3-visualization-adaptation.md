# Phase 3: 시각화 적응

> **선행 조건**: Phase 2 완료 (모든 노드 컴파일됨, 빌드 통과)
> **완료 조건**: `bun run build` + `bun run test` + dev 서버 시각 확인
> **참조**: GUIDE.md

---

## 핵심 원칙

UI 컴포넌트의 **구현 코드를 변경하지 않는다**. 상수/매핑만 검증하고 문서를 업데이트한다.

---

## TODO 3-1: 그래프 빌더 + 헬퍼 검증

### 검증 파일
- `src/features/graph/utils/builder.ts`
  - `buildClusters()`: `Object.entries(CLUSTERS)` 이터레이션 → 자동 적응
  - `seedClusterPositions()`: `clusterIds.length`로 각도 분배 → 자동 적응
  - `buildEdges()`: 관계 필드에서 엣지 생성 → 스키마 무관
- `src/lib/graph-helpers.ts`
  - `resolveClusterColor()`: `CLUSTERS[cluster]` 조회 + fallback → 자동 적응

### 테스트 파일 수정
- `src/features/graph/utils/builder.test.ts` — 픽스처의 클러스터 ID 교체
- `src/lib/graph-helpers.test.ts` — 픽스처의 클러스터 ID 교체

### 실행
```bash
bun run test
```

---

## TODO 3-2: UI 컴포넌트 검증

### 자동 적응 확인할 컴포넌트들

| 컴포넌트 | 파일 | 적응 방식 |
|---------|------|----------|
| FullNodeTree | `src/features/content/components/FullNodeTree.tsx` | `CLUSTER_IDS.map()` 이터레이션 |
| SearchSuggestions | `src/features/graph/components/SearchSuggestions.tsx` | `useNodeSearch` → `CLUSTERS` 조회 |
| ClusterBadge | `src/features/content/components/ClusterBadge.tsx` | `ClusterId` prop → CLUSTERS lookup |
| ClusterDot | `src/features/content/components/ClusterDot.tsx` | `ClusterId` prop → CLUSTERS lookup |
| ConnectionTree | `src/features/content/components/ConnectionTree.tsx` | 엣지 타입 기반 (클러스터 무관) |
| NodeHoverBadge | `src/features/graph/components/NodeHoverBadge.tsx` | `resolveClusterColor()` 호출 |

### 작업 내용
코드 변경 없음. dev 서버에서 시각적으로 확인:
1. 3D 그래프에 모든 클러스터가 다른 색상으로 표시되는가
2. 사이드바 FullNodeTree에 새 클러스터 라벨이 올바르게 표시되는가
3. 노드 선택 시 ConnectionTree가 정상 작동하는가
4. 검색 시 SearchSuggestions에 클러스터 정보가 올바른가

---

## TODO 3-3: content-pipeline SKILL.md 업데이트

### 수정 파일
`.claude/skills/content-pipeline/SKILL.md`

### 수정 내용
1. 클러스터 목록 (현재 line 58-59)을 새 클러스터 ID 목록으로 교체
2. YAML 예시의 `cluster: "geodesy"` → 새 유효한 클러스터 ID
3. 필요 시 설명 문구 업데이트

### 참조
- `src/constants/cluster.ts` — 새 클러스터 정의 (Phase 1에서 이미 수정됨)
- `.claude/docs/llm-wiki/knowledge-map.json` — 분류 체계 근거

---

## TODO 3-4: 종합 검증

### 명령
```bash
bun run build    # 프로덕션 빌드
bun run test     # 유닛 테스트
bun run lint     # 코드 린트
bun run dev      # dev 서버 (시각 확인)
```

### 시각 확인 체크리스트
- [ ] 3D 그래프: 모든 노드가 렌더링되는가
- [ ] 3D 그래프: 클러스터별 색상 구분이 되는가
- [ ] 3D 그래프: 엣지가 올바르게 연결되는가
- [ ] 사이드바: FullNodeTree에 새 클러스터 그룹이 표시되는가
- [ ] 노드 클릭: ContentSection에 본문이 렌더링되는가
- [ ] 검색: 검색어 입력 시 자동완성이 작동하는가
- [ ] SEO 페이지: `/nodes/[slug]` 경로가 정상 접근되는가
