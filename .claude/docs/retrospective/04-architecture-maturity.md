# 04. 아키텍처 설계/구현 성숙도 평가

## 개요

기술 스택 선정, 아키텍처 설계, 기능 구현의 전문성과 기술 성숙도를 평가한다.

## 아키텍처 성숙도 점수

| 영역 | 점수 | 근거 |
|------|------|------|
| 타입 안전성 | 9/10 | strict mode + no-any 규칙 + Zod 런타임 검증 |
| 피처 응집도 | 9/10 | features/ 자체 완결, 최소 결합 |
| 코드 재사용성 | 8/10 | 훅/유틸 추출 양호, 일부 중복 가능성 |
| 테스트 | 7/10 | E2E 견고, 유닛 테스트 보강 필요 |
| 에러 처리 | 9/10 | 3단계 ErrorBoundary (global → page → feature) |
| 성능 | 8/10 | 캐싱, 반응형, dynamic import — three.js 프레임당 업데이트 최적화 여지 |
| 유지보수성 | 9/10 | 명확한 분리, 노드 추가 용이 |
| **종합** | **8.4/10** | **프로덕션 레디 아키텍처** |

## 기술 스택 선정 평가

### 올바른 선택

| 선택 | 이유 | 결과 |
|------|------|------|
| Next.js 16 App Router | SSG + CSR 하이브리드, SEO 우수 | 듀얼 라우트 전략 실현 |
| TypeScript strict | 컴파일 타임 안전성 극대화 | 런타임 에러 최소화 |
| Tailwind CSS 4 | @theme 디렉티브로 디자인 토큰 통합 | CSS 변수 + 유틸리티 클래스 조화 |
| Zod | 빌드 타임 프론트매터 검증 | 잘못된 slug 참조 방지 |
| gray-matter + next-mdx-remote | 커스텀 파이프라인 유연성 | Velite 0.x 불안정성 회피 |
| Vercel Hobby | 무료, Next.js 최적 배포 | 간편한 CI/CD |

### 위험했지만 성공한 선택

| 선택 | 위험 요소 | 극복 방법 |
|------|----------|----------|
| Velite → 커스텀 파이프라인 전환 | 중간에 기술 스택 변경 | v1→v2 blueprint로 의사결정 문서화 |
| react-force-graph-3d | 번들 크기, SSR 불가 | dynamic import + Suspense |
| Next.js 16 (최신) | 커뮤니티 레퍼런스 부족 | library-practices Skill로 gotchas 문서화 |

## 아키텍처 패턴 평가

### Feature-First Colocalization (★★★★★)

```
src/features/
├── content/    # 콘텐츠 파이프라인 전체
│   ├── components/
│   ├── types/
│   └── utils/
├── graph/      # 3D 시각화 전체
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── theme/      # 테마 시스템 전체
    ├── hooks/
    └── utils/
```

- 장점: 기능별 독립성, 팀 확장 시 충돌 최소화, 삭제 용이
- 의존 방향: shared → features → app/ (단방향)
- 교차 참조 없음 (필요 시 shared/로 승격)

### Single Source of Truth (★★★★★)

```
contents/nodes/*.md (프론트매터) → Zod 검증 → graph-data.json (자동 생성)
```

- 새 노드 추가 = .md 파일 하나만 생성
- 관계 정보도 프론트매터에 포함
- 빌드 시 slug 참조 무결성 검증

### 듀얼 라우트 SEO 전략 (★★★★☆)

```
/ (분할 뷰, ?node=slug)     → 사용자 UX 최적화
/nodes/[slug] (정적 페이지)  → 검색 엔진 인덱싱 최적화
```

- generateStaticParams()로 모든 노드 사전 렌더링
- JSON-LD (WebSite + Person + TechArticle) 구조화 데이터
- canonical URL로 중복 콘텐츠 방지

### 3D 렌더링 아키텍처 (★★★★☆)

```
useGraph3DRenderer() → THREE.Mesh 캐싱 → 반응형 LOD (32/16 세그먼트)
useCameraControl() → 자동 회전 + 사용자 인터랙션 시 비활성화
useGraphLayout() → 클러스터별 원형 초기 배치 + 물리 시뮬레이션
```

- 지오메트리 캐싱으로 메모리 효율화
- 모바일 감지 시 세그먼트 수 감소 (LOD)
- easeInOut 타이밍 함수로 부드러운 호버 애니메이션

## 구현 품질 세부 평가

### TypeScript 활용도 (★★★★★)
- `noUncheckedIndexedAccess: true` — 인덱스 접근 시 undefined 처리 강제
- Zod 스키마에서 TypeScript 타입 자동 추론
- 제네릭 활용 (useSyncExternalStore 등)

### React 패턴 (★★★★☆)
- useSyncExternalStore: 테마 시스템의 서버/클라이언트 동기화
- Suspense: 3D 컴포넌트 비동기 로딩
- ErrorBoundary: 3단계 에러 격리
- 개선 여지: 일부 복잡한 컴포넌트(GraphCanvas3D)의 추가 분해

### SSR 처리 (★★★★★)
- dynamic(() => import(...), { ssr: false }): WebGL 컴포넌트 서버 실행 방지
- getServerSnapshot: useSyncExternalStore 서버 스냅샷으로 hydration mismatch 방지
- metadata export: 서버 컴포넌트에서 메타데이터 생성

## 기술 성숙도 자가 평가

| 역량 | 수준 | 근거 |
|------|------|------|
| Next.js App Router | 중급→상급 | SSG, 메타데이터, 동적 라우트, 에러 처리 |
| TypeScript | 상급 | strict mode, Zod 통합, 제네릭 |
| 3D 웹 그래픽 | 중급 | three.js 직접 조작, 캐싱, LOD — 셰이더 미사용 |
| React 상태 관리 | 상급 | useSyncExternalStore, URL 상태 동기화 |
| CSS/디자인 시스템 | 중급→상급 | Tailwind 4, CSS 변수, 테마 전환 |
| 테스트 | 중급 | E2E 견고, 유닛 테스트 비율 낮음 |
| SEO | 중급→상급 | 구조화 데이터, sitemap, canonical, OG |

## 액션 아이템

- [ ] GraphCanvas3D 컴포넌트 분해 검토 (렌더링 로직 분리)
- [ ] 유닛 테스트 커버리지 확대 (파이프라인, 그래프 빌더 중심)
- [ ] three.js 성능 최적화 (인스턴스드 메시, 오프스크린 캔버스 등) 학습
- [ ] bundle analyzer 도입하여 번들 크기 모니터링
- [ ] 아키텍처 결정 기록(ADR) 습관화 — 다음 프로젝트부터 적용
