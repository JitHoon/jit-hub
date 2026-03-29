import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Prototype | JIT-Hub",
  robots: "noindex",
};

/* ────────────────────────────────────────────
   Mock 데이터: 허브 노드 (클러스터 대표)
   ──────────────────────────────────────────── */
const HUBS = [
  {
    id: "geodesy",
    label: "측지·좌표계",
    color: "oklch(0.65 0.18 145)",
    x: 22,
    y: 30,
    size: 56,
    connections: 8,
  },
  {
    id: "graphics",
    label: "3D 그래픽스",
    color: "oklch(0.65 0.18 265)",
    x: 55,
    y: 20,
    size: 64,
    connections: 11,
  },
  {
    id: "implementation",
    label: "구현 사례",
    color: "oklch(0.65 0.15 30)",
    x: 78,
    y: 45,
    size: 48,
    connections: 6,
  },
  {
    id: "decision",
    label: "의사결정",
    color: "oklch(0.65 0.15 90)",
    x: 38,
    y: 65,
    size: 52,
    connections: 7,
  },
  {
    id: "infrastructure",
    label: "인프라·배포",
    color: "oklch(0.6 0.12 220)",
    x: 68,
    y: 72,
    size: 44,
    connections: 5,
  },
  {
    id: "frontend",
    label: "프론트엔드",
    color: "oklch(0.65 0.18 310)",
    x: 15,
    y: 58,
    size: 40,
    connections: 4,
  },
] as const;

/* 허브 간 연결선 (인덱스 쌍) */
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [1, 4],
  [3, 5],
  [0, 5],
];

/* 상태 2 Mock: "의사결정" 허브의 리프 노드 */
const LEAVES = [
  {
    id: "cesium-adoption",
    label: "Cesium.js 도입",
    x: 30,
    y: 55,
    size: 20,
  },
  {
    id: "fbxloader-memory-leak",
    label: "FBXLoader 메모리 누수",
    x: 46,
    y: 58,
    size: 18,
  },
  {
    id: "ifc-3dtiles-pipeline",
    label: "IFC→3D Tiles",
    x: 34,
    y: 75,
    size: 16,
  },
  {
    id: "aws-lambda-ec2",
    label: "Lambda vs EC2",
    x: 48,
    y: 73,
    size: 16,
  },
];

/* 클러스터 전체 (배지 쇼케이스용) */
const ALL_CLUSTERS = [
  { id: "geodesy", label: "측지·좌표계", color: "oklch(0.65 0.18 145)" },
  { id: "graphics", label: "3D 그래픽스", color: "oklch(0.65 0.18 265)" },
  { id: "implementation", label: "구현 사례", color: "oklch(0.65 0.15 30)" },
  { id: "problem", label: "문제 해결", color: "oklch(0.65 0.18 0)" },
  { id: "optimization", label: "최적화", color: "oklch(0.65 0.18 60)" },
  {
    id: "infrastructure",
    label: "인프라·배포",
    color: "oklch(0.6 0.12 220)",
  },
  { id: "frontend", label: "프론트엔드", color: "oklch(0.65 0.18 310)" },
  { id: "format", label: "데이터 포맷", color: "oklch(0.6 0.12 180)" },
  { id: "decision", label: "의사결정", color: "oklch(0.65 0.15 90)" },
] as const;

const DIFFICULTIES = [
  { level: "beginner", label: "입문", emoji: "1" },
  { level: "intermediate", label: "중급", emoji: "2" },
  { level: "advanced", label: "고급", emoji: "3" },
  { level: "expert", label: "전문가", emoji: "4" },
] as const;

/* ────────────────────────────────────────────
   섹션 헤더 컴포넌트
   ──────────────────────────────────────────── */
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 border-b border-border pb-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

/* ────────────────────────────────────────────
   섹션 A: 상태 1 — 초기 화면 (풀스크린 그래프)
   ──────────────────────────────────────────── */
function StateOneGraph() {
  return (
    <section className="mb-16">
      <SectionHeader
        title="상태 1: 초기 화면"
        subtitle="허브 노드만 표시. 클러스터별 색상, 크기 = 연결 수 비례"
      />
      <div className="relative h-[500px] overflow-hidden rounded-2xl bg-[oklch(0.11_0.01_260)] md:h-[600px]">
        {/* 배경 그라디언트 오버레이 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.18 0.03 260 / 0.6), transparent)",
          }}
        />

        {/* SVG 연결선 */}
        <svg className="absolute inset-0 h-full w-full">
          {EDGES.map(([from, to]) => {
            const a = HUBS[from] as (typeof HUBS)[number];
            const b = HUBS[to] as (typeof HUBS)[number];
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="oklch(0.35 0.02 260)"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}
        </svg>

        {/* 허브 노드 */}
        {HUBS.map((hub) => (
          <div
            key={hub.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
          >
            {/* 노드 원 */}
            <div
              className="rounded-full"
              style={{
                width: hub.size,
                height: hub.size,
                backgroundColor: hub.color,
                boxShadow: `0 0 ${hub.size * 0.6}px ${hub.color.replace(")", " / 0.4)")}`,
              }}
            />
            {/* 라벨 */}
            <span className="whitespace-nowrap text-xs font-medium text-[oklch(0.8_0_0)]">
              {hub.label}
            </span>
          </div>
        ))}

        {/* 좌하단 범례 */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1 rounded-lg bg-[oklch(0.15_0.01_260_/_0.8)] px-3 py-2 backdrop-blur-sm">
          <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[oklch(0.5_0_0)]">
            Clusters
          </span>
          {HUBS.map((hub) => (
            <div key={hub.id} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hub.color }}
              />
              <span className="text-[11px] text-[oklch(0.7_0_0)]">
                {hub.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   섹션 B: 상태 2 — 호버 (리프 펼치기)
   ──────────────────────────────────────────── */
function StateTwoHover() {
  const hoveredHub = HUBS[3]; // "의사결정"
  return (
    <section className="mb-16">
      <SectionHeader
        title="상태 2: 허브 호버"
        subtitle='"의사결정" 허브에 호버 → 리프 노드 펼쳐짐'
      />
      <div className="relative h-[500px] overflow-hidden rounded-2xl bg-[oklch(0.11_0.01_260)] md:h-[600px]">
        {/* 배경 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 42% 60%, oklch(0.18 0.03 90 / 0.3), transparent)",
          }}
        />

        {/* 연결선: 허브 간 (비활성 상태) */}
        <svg className="absolute inset-0 h-full w-full">
          {EDGES.map(([from, to]) => {
            const a = HUBS[from] as (typeof HUBS)[number];
            const b = HUBS[to] as (typeof HUBS)[number];
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="oklch(0.25 0.01 260)"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          {/* 연결선: 허브 → 리프 (활성) */}
          {LEAVES.map((leaf) => (
            <line
              key={`hub-${leaf.id}`}
              x1={`${hoveredHub.x}%`}
              y1={`${hoveredHub.y}%`}
              x2={`${leaf.x}%`}
              y2={`${leaf.y}%`}
              stroke={hoveredHub.color}
              strokeWidth="1.5"
              opacity="0.6"
              strokeDasharray="4 3"
            />
          ))}
        </svg>

        {/* 허브 노드 (흐릿하게, 호버된 것만 강조) */}
        {HUBS.map((hub) => {
          const isHovered = hub.id === hoveredHub.id;
          return (
            <div
              key={hub.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
              style={{
                left: `${hub.x}%`,
                top: `${hub.y}%`,
                opacity: isHovered ? 1 : 0.35,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: isHovered ? hub.size * 1.15 : hub.size,
                  height: isHovered ? hub.size * 1.15 : hub.size,
                  backgroundColor: hub.color,
                  boxShadow: isHovered
                    ? `0 0 ${hub.size}px ${hub.color.replace(")", " / 0.6)")}, 0 0 ${hub.size * 2}px ${hub.color.replace(")", " / 0.2)")}`
                    : "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              <span
                className="whitespace-nowrap text-xs font-medium"
                style={{
                  color: isHovered ? "oklch(0.93 0 0)" : "oklch(0.5 0 0)",
                }}
              >
                {hub.label}
              </span>
            </div>
          );
        })}

        {/* 리프 노드 */}
        {LEAVES.map((leaf) => (
          <div
            key={leaf.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%` }}
          >
            <div
              className="rounded-full"
              style={{
                width: leaf.size,
                height: leaf.size,
                backgroundColor: hoveredHub.color.replace("0.65", "0.55"),
                boxShadow: `0 0 ${leaf.size * 0.5}px ${hoveredHub.color.replace(")", " / 0.3)")}`,
              }}
            />
            <span className="max-w-20 truncate text-center text-[10px] text-[oklch(0.7_0_0)]">
              {leaf.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   섹션 C: 상태 3 — 분할 뷰
   ──────────────────────────────────────────── */
function StateThreeSplitView() {
  return (
    <section className="mb-16">
      <SectionHeader
        title="상태 3: 분할 뷰"
        subtitle="노드 클릭 → 좌: 축소 그래프 / 우: 콘텐츠 패널"
      />

      {/* 데스크톱 분할 뷰 */}
      <div className="flex h-[700px] overflow-hidden rounded-2xl border border-border">
        {/* 좌측: 축소 그래프 */}
        <div className="relative w-[42%] shrink-0 bg-[oklch(0.11_0.01_260)]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.16 0.02 260 / 0.5), transparent)",
            }}
          />
          <svg className="absolute inset-0 h-full w-full">
            {EDGES.map(([from, to]) => {
              const a = HUBS[from] as (typeof HUBS)[number];
              const b = HUBS[to] as (typeof HUBS)[number];
              return (
                <line
                  key={`split-${a.id}-${b.id}`}
                  x1={`${a.x}%`}
                  y1={`${a.y}%`}
                  x2={`${b.x}%`}
                  y2={`${b.y}%`}
                  stroke="oklch(0.30 0.02 260)"
                  strokeWidth="1"
                  opacity="0.4"
                />
              );
            })}
          </svg>
          {HUBS.map((hub) => {
            const isSelected = hub.id === "decision";
            return (
              <div
                key={hub.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{
                  left: `${hub.x}%`,
                  top: `${hub.y}%`,
                  opacity: isSelected ? 1 : 0.5,
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: hub.size * 0.7,
                    height: hub.size * 0.7,
                    backgroundColor: hub.color,
                    boxShadow: isSelected
                      ? `0 0 ${hub.size * 0.5}px ${hub.color.replace(")", " / 0.5)")}`
                      : "none",
                    border: isSelected
                      ? "2px solid oklch(0.93 0 0 / 0.5)"
                      : "none",
                  }}
                />
                <span className="text-[10px] text-[oklch(0.6_0_0)]">
                  {hub.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 디바이더 */}
        <div className="flex w-[6px] shrink-0 cursor-col-resize items-center justify-center bg-border">
          <div className="flex flex-col gap-0.5">
            <div className="h-1 w-1 rounded-full bg-muted" />
            <div className="h-1 w-1 rounded-full bg-muted" />
            <div className="h-1 w-1 rounded-full bg-muted" />
          </div>
        </div>

        {/* 우측: 콘텐츠 패널 */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="px-8 py-6">
            {/* 헤더 */}
            <div className="mb-6 flex flex-wrap items-start gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Cesium.js 도입 결정
              </h1>
              <div className="flex items-center gap-2">
                {/* 클러스터 배지 */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "oklch(0.65 0.15 90 / 0.15)",
                    color: "oklch(0.65 0.15 90)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: "oklch(0.65 0.15 90)",
                    }}
                  />
                  의사결정
                </span>
                {/* 난이도 */}
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">
                  Lv.2 중급
                </span>
              </div>
            </div>

            {/* 태그 */}
            <div className="mb-6 flex flex-wrap gap-1.5">
              {[
                "cesium",
                "migration",
                "decision-making",
                "3d-viewer",
                "architecture",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-surface px-2 py-0.5 text-xs text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 본문 (prose-jithub) */}
            <div className="prose-jithub">
              <h2>한 줄 요약</h2>
              <p>
                메모리 누수, 고객사의 Mesh 시각화 요구, 기존 뷰어의 구조적
                한계가 겹치면서, 1인 마이그레이션이라는 리소스 제약 속에서
                비용·커스텀 자유도·데이터 보안·대용량 Mesh 지원을 기준으로 세
                가지 선택지를 비교한 끝에 &quot;자체 서버 Builder +
                Cesium.js&quot;를 선택했다.
              </p>

              <h2>왜 전환이 필요했는가</h2>
              <p>
                이 결정의 출발점은 하나의 기술 문제가 아니라, 동시에 닥친{" "}
                <strong>여러 압력</strong>이었다.
              </p>
              <ul>
                <li>
                  <strong>메모리 문제</strong>: FBXLoader의 메모리 누수를
                  dispose()로 완화했지만, 메모리 변동폭 자체는 개선되지 않았다.
                </li>
                <li>
                  <strong>비즈니스 요구</strong>: 계약 가능성이 높은 고객사들이
                  Mesh 모델 시각화를 필수 기능으로 요구.
                </li>
                <li>
                  <strong>사용자 선호도</strong>: Point Cloud보다 Mesh를 명확히
                  선호.
                </li>
                <li>
                  <strong>경쟁 환경</strong>: 경쟁 서비스들이 이미 Mesh 시각화를
                  제공.
                </li>
              </ul>

              <h2>세 가지 선택지 비교</h2>
              <h3>선택지 3: 자체 파이프라인 + Cesium.js (최종 선택)</h3>
              <p>
                3D Tiles 변환 파이프라인을 자체적으로 구축하고, Cesium.js로
                렌더링. 초기 비용이 크지만{" "}
                <strong>비용 통제·커스텀 자유도·데이터 보안</strong> 모두에서
                우세.
              </p>

              <pre>
                <code>{`// Cesium.js 기본 설정 예시
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  timeline: false,
  animation: false,
});

// 3D Tiles 로딩
const tileset = await Cesium.Cesium3DTileset.fromUrl(
  "/api/tiles/model-001/tileset.json"
);
viewer.scene.primitives.add(tileset);`}</code>
              </pre>

              <h2>이 경험에서 추출한 원칙</h2>
              <ul>
                <li>
                  기술 선택은 기술적 우월성만으로 결정되지 않는다. 비용, 보안,
                  팀 리소스를 함께 본다.
                </li>
                <li>설득은 구두가 아니라 문서로 한다.</li>
                <li>
                  PoC는 &quot;되는지 확인&quot;이 아니라 &quot;어디서 막히는지
                  발견&quot;이다.
                </li>
              </ul>
            </div>

            {/* 연결 노드 */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="mb-3 text-sm font-medium text-muted">
                연결된 노드
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "FBXLoader 메모리 누수",
                    rel: "triggeredBy",
                    cluster: "problem",
                    color: "oklch(0.65 0.18 0)",
                  },
                  {
                    label: "3D Tiles 스펙",
                    rel: "requires",
                    cluster: "format",
                    color: "oklch(0.6 0.12 180)",
                  },
                  {
                    label: "Mesh·BIM·Point Cloud",
                    rel: "enables",
                    cluster: "format",
                    color: "oklch(0.6 0.12 180)",
                  },
                  {
                    label: "측정 도구 7종",
                    rel: "implemented",
                    cluster: "implementation",
                    color: "oklch(0.65 0.15 30)",
                  },
                  {
                    label: "좌표계 변환",
                    rel: "revealed",
                    cluster: "geodesy",
                    color: "oklch(0.65 0.18 145)",
                  },
                ].map((node) => (
                  <div
                    key={node.label}
                    className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 transition-colors hover:bg-surface-elevated"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="flex-1 text-sm">{node.label}</span>
                    <span className="text-xs text-muted">{node.rel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 프리뷰 */}
      <div className="mt-6">
        <p className="mb-3 text-sm text-muted">
          768px 이하: 세로 스택 레이아웃
        </p>
        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border">
          {/* 그래프 영역 (축소) */}
          <div className="relative h-48 bg-[oklch(0.11_0.01_260)]">
            {HUBS.slice(0, 4).map((hub) => (
              <div
                key={`mobile-${hub.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: hub.size * 0.5,
                    height: hub.size * 0.5,
                    backgroundColor: hub.color,
                    boxShadow: `0 0 ${hub.size * 0.3}px ${hub.color.replace(")", " / 0.3)")}`,
                  }}
                />
              </div>
            ))}
          </div>
          {/* 콘텐츠 (축약) */}
          <div className="bg-background p-4">
            <h3 className="text-lg font-bold">Cesium.js 도입 결정</h3>
            <div className="mt-2 flex gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: "oklch(0.65 0.15 90 / 0.15)",
                  color: "oklch(0.65 0.15 90)",
                }}
              >
                의사결정
              </span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">
                Lv.2
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              메모리 누수, 고객사의 Mesh 시각화 요구, 기존 뷰어의 구조적 한계가
              겹치면서...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   섹션 D: 컴포넌트 쇼케이스
   ──────────────────────────────────────────── */
function ComponentShowcase() {
  return (
    <section className="mb-16">
      <SectionHeader
        title="컴포넌트 쇼케이스"
        subtitle="클러스터 배지, 난이도, 관계 라벨, 버튼, 스켈레톤"
      />

      <div className="space-y-8">
        {/* 클러스터 배지 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">
            클러스터 배지 (9종)
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALL_CLUSTERS.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${c.color.replace(")", " / 0.15)")}`,
                  color: c.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* 난이도 인디케이터 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">
            난이도 인디케이터
          </h3>
          <div className="flex flex-wrap gap-3">
            {DIFFICULTIES.map((d) => (
              <span
                key={d.level}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs"
              >
                <span className="font-mono text-[10px] text-muted">
                  Lv.{d.emoji}
                </span>
                <span>{d.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 관계 유형 라벨 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">
            관계 유형 라벨
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "triggeredBy",
              "requires",
              "enables",
              "implemented",
              "revealed",
              "built",
              "appliedIn",
            ].map((rel) => (
              <span
                key={rel}
                className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-xs text-muted"
              >
                {rel}
              </span>
            ))}
          </div>
        </div>

        {/* 버튼 스타일 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">버튼</h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
            >
              Secondary
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              Ghost
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="닫기"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* 로딩 스켈레톤 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">로딩 스켈레톤</h3>
          <div className="max-w-md space-y-3 rounded-xl border border-border bg-background p-6">
            <div className="h-6 w-3/4 animate-pulse rounded bg-surface" />
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-surface" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-surface" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-surface" />
            </div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-surface" />
          </div>
        </div>

        {/* 코드 블록 스타일 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted">코드 블록</h3>
          <div className="prose-jithub max-w-lg">
            <pre>
              <code>{`// 좌표 변환 예시
const wgs84Position = Cesium.Cartesian3.fromDegrees(
  longitude, // 경도
  latitude,  // 위도
  height     // 높이 (m)
);

viewer.camera.flyTo({
  destination: wgs84Position,
  duration: 1.5,
});`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   메인 페이지
   ──────────────────────────────────────────── */
export default function DesignPrototypePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="mb-12">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">
          Design Prototype
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          JIT-Hub UI/UX
        </h1>
        <p className="mt-2 text-base text-muted">
          3가지 인터랙션 상태 + 컴포넌트 시스템 프로토타입. 라이트/다크 모드
          전환으로 양쪽 모두 확인 가능.
        </p>
      </div>

      <StateOneGraph />
      <StateTwoHover />
      <StateThreeSplitView />
      <ComponentShowcase />
    </main>
  );
}
