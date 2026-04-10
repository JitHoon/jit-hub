# Component Patterns

프로토타입(`src/app/design/page.tsx`)에서 검증된 UI 패턴 레퍼런스.
구현 시 이 패턴을 따르되, 토큰 값은 반드시 `tokens.ts` / `clusters.ts` / CSS 변수를 참조한다.

---

## 클러스터 뱃지

노드 상세 패널 상단에 표시. 클러스터 소속을 알려주는 최소 단위.

```
구조: [●] [클러스터 라벨]
```

| 속성     | 라이트                                               | 다크                           |
| -------- | ---------------------------------------------------- | ------------------------------ |
| 배경     | `{clusterColor}12` (7% 투명도)                       | `{clusterColor}18` (9% 투명도) |
| 텍스트   | `{clusterColor}` 원색 그대로                         | `{clusterColor}` 원색 그대로   |
| 도트     | `{clusterColor}` 원색, `h-1.5 w-1.5 rounded-full`    | 동일                           |
| 레이아웃 | `flex items-center gap-1.5`                          | 동일                           |
| 타이포   | `text-[10px] font-semibold uppercase tracking-wider` | 동일                           |
| 모서리   | `rounded-sm`                                         | 동일                           |
| 패딩     | `px-2 py-0.5`                                        | 동일                           |

```tsx
<span
  className="flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
  style={{
    backgroundColor: dark ? `${color}18` : `${color}12`,
    color: color,
  }}
>
  <span
    className="h-1.5 w-1.5 rounded-full"
    style={{ backgroundColor: color }}
  />
  {label}
</span>
```

---

## 난이도 라벨

클러스터 뱃지 옆에 나란히 표시.

| 속성   | 값                       |
| ------ | ------------------------ |
| 타이포 | `text-[10px]`            |
| 색상   | `--muted` (`text-muted`) |
| 형식   | `Lv.{n} {난이도명}`      |

---

## 태그

노드 제목 아래에 가로 나열. 프론트매터의 `tags` 배열에서 생성.

| 속성   | 라이트                       | 다크                         |
| ------ | ---------------------------- | ---------------------------- |
| 배경   | `--surface` 계열 (`#F7F7F7`) | `--surface` 계열 (`#1F1F1F`) |
| 테두리 | `--border`                   | `--border`                   |
| 텍스트 | `--text`                     | `--text`                     |
| 타이포 | `font-mono text-[10px]`      | 동일                         |
| 모서리 | `rounded-sm`                 | 동일                         |
| 패딩   | `px-2 py-0.5`                | 동일                         |
| 간격   | `flex flex-wrap gap-1.5`     | 동일                         |

```tsx
<span
  className="rounded-sm border px-2 py-0.5 font-mono text-[10px]"
  style={{
    borderColor: "var(--border)",
    color: "var(--text)",
    backgroundColor: "var(--surface)",
  }}
>
  {tag}
</span>
```

---

## 리드 인용문

노드 본문 시작 전, 핵심 요약을 좌측 컬러 보더로 강조.

| 속성        | 값                                                       |
| ----------- | -------------------------------------------------------- |
| 좌측 보더   | `border-l-[3px]`, 색상 = 해당 클러스터 컬러              |
| 패딩        | `pl-4`                                                   |
| 본문 타이포 | `text-[13px] leading-[1.85]`, `font-sans` (Noto Sans KR) |
| 본문 색상   | `--text`                                                 |

```tsx
<div className="border-l-[3px] pl-4" style={{ borderColor: clusterColor }}>
  <p
    className="text-[13px] leading-[1.85] font-sans"
    style={{ color: "var(--text)" }}
  >
    {summary}
  </p>
</div>
```

---

## 본문 제목 (h2)

| 속성   | 값                                 |
| ------ | ---------------------------------- |
| 타이포 | `text-lg font-bold tracking-tight` |
| 폰트   | `font-display` (Lexend)            |
| 색상   | `--foreground`                     |

---

## 본문 텍스트

| 속성   | 값                                 |
| ------ | ---------------------------------- |
| 타이포 | `text-[13px] leading-[1.85]`       |
| 폰트   | `font-sans` (Noto Sans KR)         |
| 색상   | `--text`                           |
| strong | `--foreground`, `font-weight: 600` |

---

## 킥 컬러 불릿 리스트

일반 `<ul>` 대신 킥 컬러 도트로 시각적 위계를 만드는 패턴.

| 속성     | 값                                                       |
| -------- | -------------------------------------------------------- |
| 도트     | `h-2 w-2 rounded-full`, 킥 컬러 또는 클러스터 컬러       |
| 레이아웃 | `flex gap-3`, 도트는 `mt-1.5 shrink-0`                   |
| 제목     | `text-[13px] font-semibold`, `font-sans`, `--foreground` |
| 설명     | `text-[13px] leading-[1.75]`, `font-sans`, `--text`      |

```tsx
<li className="flex gap-3" style={{ listStyle: "none" }}>
  <span
    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: dotColor }}
  />
  <div>
    <span
      className="text-[13px] font-semibold font-sans"
      style={{ color: "var(--foreground)" }}
    >
      {title}
    </span>
    <p
      className="mt-0.5 text-[13px] leading-[1.75] font-sans"
      style={{ color: "var(--text)" }}
    >
      {description}
    </p>
  </div>
</li>
```

---

## 비교 테이블

의사결정 노드 등에서 선택지를 비교할 때 사용.

| 속성         | 값                                                  |
| ------------ | --------------------------------------------------- |
| 외곽         | `rounded-md border overflow-hidden`, `--border`     |
| 타이포       | `text-[11px]`, `font-sans`                          |
| 헤더 행 배경 | `--surface`                                         |
| 헤더 텍스트  | `font-semibold`, 각 열에 킥/클러스터 컬러 적용 가능 |
| 셀 패딩      | `px-4 py-2` (바디) / `px-4 py-2.5` (헤더)           |
| 행 구분선    | `border-t`, `--border`                              |
| 강조 열      | `font-medium`, 킥 컬러 텍스트                       |

---

## 분할 뷰 레이아웃

메인 페이지의 좌(그래프) + 우(콘텐츠) 구조.

| 영역          | 속성                                                       |
| ------------- | ---------------------------------------------------------- |
| 전체          | `flex h-full`, 외곽 `rounded-lg border`                    |
| 좌측 (그래프) | `w-[38%] shrink-0`, `hidden md:block` (모바일 숨김)        |
| 좌측 배경     | `--graph-bg`                                               |
| 디바이더      | `w-px shrink-0`, `--border` 배경                           |
| 우측 (콘텐츠) | `flex-1 overflow-y-auto p-8`                               |
| 우측 배경     | `--surface-elevated` (라이트: `#FFFFFF` / 다크: `#1A1A1A`) |

---

## 그래프 노드 인터랙션

### 허브 노드 (클러스터 대표)

| 상태 | 배경색            | 스케일 | 그림자      | 라벨 색상          |
| ---- | ----------------- | ------ | ----------- | ------------------ |
| 기본 | `GRAPH_GRAY.node` | `1`    | 없음        | `GRAPH_GRAY.label` |
| 호버 | `cluster.color`   | `1.1`  | `glow-node` | `--foreground`     |

- 전환: `transition 0.25s ease` (배경, 그림자, 스케일 모두)
- 플로팅: `float-a/b/c` 3궤도, `index % 3`으로 분배
- 호버 시: `animationPlayState: paused`

### 리프 노드 (개별 지식)

| 상태      | 배경색                 | 투명도                      | 라벨 색상                |
| --------- | ---------------------- | --------------------------- | ------------------------ |
| 기본      | `GRAPH_GRAY.nodeFaded` | `0.6` (노드) / `0.5` (전체) | `GRAPH_GRAY.label`       |
| 부모 호버 | `cluster.color`        | `0.8` (노드) / `1` (전체)   | `GRAPH_GRAY.labelActive` |

### 엣지

| 유형      | 기본                                                                               | 호버 시                              |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| 허브-허브 | `GRAPH_GRAY.edge`, `strokeWidth: 1`, `opacity: 0.4`                                | 연결된 클러스터 컬러, `opacity: 0.5` |
| 허브-리프 | `GRAPH_GRAY.leafEdge`, `strokeWidth: 0.5`, `opacity: 0.15`, `strokeDasharray: 3 4` | 클러스터 컬러, `opacity: 0.5`        |

---

## 그래프 캔버스

| 속성        | 라이트                                         | 다크      |
| ----------- | ---------------------------------------------- | --------- |
| 배경        | `#F0F0F0`                                      | `#0E0E0E` |
| 도트 그리드 | `radial-gradient`, `backgroundSize: 24px 24px` | 동일      |
| 도트 투명도 | `0.3`                                          | `0.04`    |

---

## 테마 토글 스위치

| 속성      | 값                                                   |
| --------- | ---------------------------------------------------- |
| 외곽      | `rounded-full border px-3 py-1.5`                    |
| 트랙      | `h-4 w-8 rounded-full`                               |
| 트랙 배경 | 라이트: `--surface-alt` / 다크: `KICK.blue`          |
| 썸        | `h-3 w-3 rounded-full`                               |
| 썸 위치   | `translateX(0)` (라이트) / `translateX(14px)` (다크) |
| 라벨      | `text-[10px] font-medium`                            |
| 전환      | `transition-colors duration-200`                     |

---

## 섹션 라벨

각 섹션 상단의 카테고리 표시.

| 속성   | 값                                                     |
| ------ | ------------------------------------------------------ |
| 타이포 | `text-[11px] font-semibold uppercase tracking-[0.2em]` |
| 색상   | `--muted`                                              |
| 폰트   | `font-sans` (Noto Sans KR)                             |
| 마진   | `mb-6`                                                 |

---

## 스타일 태그 뱃지

타이포그래피 섹션에서 "Functional Modern" 같은 스타일 분류를 표시.

| 속성   | 라이트                                              | 다크                  |
| ------ | --------------------------------------------------- | --------------------- |
| 배경   | `{KICK.blue}12`                                     | `{KICK.blue}20`       |
| 텍스트 | `KICK.blue`                                         | `#6CB4EE` (밝은 블루) |
| 타이포 | `text-[9px] font-semibold uppercase tracking-wider` | 동일                  |
| 모서리 | `rounded-sm`                                        | 동일                  |
| 패딩   | `px-2 py-0.5`                                       | 동일                  |

---

## 소스 파일 매핑

| 파일                      | 역할                                       |
| ------------------------- | ------------------------------------------ |
| `src/lib/tokens.ts`       | JS 토큰 상수 — 컴포넌트에서 import         |
| `src/lib/clusters.ts`     | 클러스터 HEX + 라벨 — 그래프/뱃지에서 사용 |
| `src/app/globals.css`     | CSS 변수 — Tailwind 클래스에서 참조        |
| `src/app/design/page.tsx` | 프로토타입 원본 — 패턴 검증 기준           |
