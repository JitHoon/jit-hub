# Phase 1: 스키마 적응

> **선행 조건**: Phase 0 완료 + knowledge-map.json 사용자 승인
> **완료 조건**: `bun run build` + `bun run test` 통과
> **참조**: GUIDE.md, knowledge-map.json

---

## TODO 1-1: 클러스터 상수 교체

### 수정 파일
`src/constants/cluster.ts`

### 현재 구조 (유지할 패턴)
```typescript
export const CLUSTER_IDS = [
  "geodesy", "graphics", "implementation", "problem",
  "optimization", "infrastructure", "frontend", "format", "decision",
] as const;

export type ClusterId = (typeof CLUSTER_IDS)[number];
export type KickBase = "red" | "blue" | "green" | "yellow";

interface ClusterMeta {
  label: string;
  color: string;
  base: KickBase;
}

export const CLUSTERS: Record<ClusterId, ClusterMeta> = {
  geodesy: { label: "측지·좌표계", color: "#00A651", base: "green" },
  // ... 나머지 8개
} satisfies Record<ClusterId, ClusterMeta>;

export function getClusterColor(cluster: ClusterId): string { ... }
export function getClusterLabel(cluster: ClusterId): string { ... }
```

### 변경 방법
1. `.claude/docs/llm-wiki/knowledge-map.json` 읽기
2. `CLUSTER_IDS` 배열을 새 ID들로 교체
3. `CLUSTERS` 레코드를 새 메타 데이터로 교체
4. **구조, export, 함수 시그니처는 동일하게 유지**

### 영향 범위 (TypeScript가 컴파일 에러로 알려줄 파일들)
이후 TODO들에서 순차적으로 수정한다.

---

## TODO 1-2: Zod 스키마 검증

### 확인 파일
- `src/features/content/types/schema.ts` — `z.enum(CLUSTER_IDS)` 자동 반영 확인
- `src/types/node.ts` — `Cluster` 타입 alias 확인

### 작업 내용
코드 변경 없이 **검증만** 수행. `CLUSTER_IDS`를 import하므로 자동 반영된다.

---

## TODO 1-3: 테스트 파일 업데이트

### 수정 파일 목록
```
src/constants/cluster.test.ts
src/features/content/types/schema.test.ts
src/features/graph/utils/builder.test.ts
src/lib/graph-helpers.test.ts
```

### 작업 방법
1. 각 테스트 파일 읽기
2. 하드코딩된 옛 클러스터 ID 문자열 찾기 (예: `"geodesy"`, `"graphics"`)
3. knowledge-map.json의 새 클러스터 ID로 교체
4. `bun run test` 실행하여 통과 확인

### 주의사항
- 테스트 로직은 변경하지 않음 — 픽스처 데이터만 교체
- 테스트가 9라는 숫자를 단언하는 곳이 있으면 새 클러스터 수로 변경

---

## TODO 1-4: 스토리북 파일 업데이트

### 수정 파일 목록 (8개)
```
src/stories/design-system/Clusters.stories.tsx
src/features/graph/components/NodeHoverBadge.stories.tsx
src/features/content/components/NodeLink.stories.tsx
src/features/content/components/ContentHeader.stories.tsx
src/features/content/components/ConnectionTree.stories.tsx
src/features/content/components/CollapsibleGroup.stories.tsx
src/features/content/components/ClusterDot.stories.tsx
src/features/content/components/ClusterBadge.stories.tsx
```

### 작업 방법
1. 각 스토리 파일 읽기
2. `cluster: "geodesy"` 같은 하드코딩된 값을 새 클러스터 ID로 교체
3. Clusters.stories.tsx는 전체 클러스터 목록을 렌더링할 수 있으므로 구조 재확인

### 주의사항
- 스토리의 시각적 결과는 달라짐 (새 색상) — 이것은 의도된 변경
- args/decorators에서 클러스터 값을 찾아 교체

---

## TODO 1-5: 빌드 검증

### 실행 명령
```bash
bun run build   # 프로덕션 빌드 (graph-data.json 생성 포함)
bun run test    # Vitest 유닛 테스트
bun run lint    # ESLint + Prettier
```

### 통과 기준
- 빌드 에러 0건
- 테스트 전부 통과
- lint 에러 0건 (warning은 허용)

### 콘텐츠 호환성 문제
Phase 1 완료 시점에서 기존 `contents/nodes/*.md`의 `cluster` 값은 아직 옛 ID다.
빌드가 실패할 수 있다. 이 경우:

**권장**: 기존 노드 파일의 `cluster` 프론트매터 필드만 일괄 변경 (본문 유지).
knowledge-map.json의 nodeAssignments를 참고하여 각 slug의 새 cluster를 대입한다.

```bash
# 예시 (실제 값은 knowledge-map.json 참조)
# 각 .md 파일의 cluster: "old-id" → cluster: "new-id"
```

이렇게 하면 Phase 1에서 빌드가 통과하고, Phase 2에서 본문까지 재작성한다.
