# 커스텀 훅 설계 가이드

## 추출 판단 기준

### 추출한다

| 상황 | 이유 |
|------|------|
| `useSyncExternalStore` 어댑터 | 구독/스냅샷 로직이 프레젠테이션과 무관 |
| 2+ 컴포넌트에서 동일 상태 로직 | 중복 제거 |
| `useEffect` + `useState` 세트 | 하나의 관심사를 캡슐화 |
| 복잡한 `useReducer` 로직 | 상태 전이 로직 독립 테스트 가능 |
| 외부 API 구독 (WebSocket, EventSource) | 리소스 관리를 훅에 캡슐화 |

### 추출하지 않는다

| 상황 | 이유 |
|------|------|
| 단일 `useState` | 과도한 추상화, 가독성 저하 |
| 3줄 이하 로직 | 파일 분리 비용 > 이득 |
| 한 컴포넌트 전용 + 단순 | Colocation 원칙 위반 |

## 네이밍 컨벤션

```
use + 명사/동사 (관심사 설명)
```

| 좋은 이름 | 나쁜 이름 | 이유 |
|-----------|-----------|------|
| `useTheme` | `useThemeStuff` | 구체적 관심사 |
| `useGraphData` | `useData` | 도메인 컨텍스트 |
| `useLocalStorage` | `useStorage` | 구현 명확 |
| `useNodeSelection` | `useSelected` | 무엇이 선택되는지 |

## 반환값 설계

```tsx
// 값 1~2개: 튜플
function useToggle(initial = false): [boolean, () => void] { ... }

// 값 3개 이상: 객체 (이름으로 접근)
interface UseThemeReturn {
  theme: Theme;
  toggle: () => void;
}
function useTheme(): UseThemeReturn { ... }
```

- 반환 타입은 `interface`로 명시 (프로젝트 규칙)
- 내부 구현 세부사항 노출 금지 — 소비자가 필요한 것만 반환
- `useCallback`은 훅 내부에서 감싸고 안정적인 참조만 반환

## 구조 패턴

```tsx
"use client";

import { /* React hooks */ } from "react";
import { /* lib utilities */ } from "@/lib/...";

// 모듈 레벨 private 함수 (구현 세부사항)
function subscribe(callback: () => void): () => void { ... }
function getSnapshot(): T { ... }

// 반환 타입 interface
interface UseFeatureReturn {
  value: T;
  action: () => void;
}

// 훅 본체 (export)
export function useFeature(): UseFeatureReturn {
  // React 훅 호출
  // 안정적인 콜백 생성
  // 반환
}
```

## 이 프로젝트 실제 예시

### `src/hooks/useTheme.ts`

```
src/lib/theme.ts          ← 순수 유틸: getEffectiveTheme, toggleTheme, applyTheme
src/hooks/useTheme.ts     ← React 어댑터: useSyncExternalStore + subscribe
src/components/ThemeToggle.tsx  ← 프레젠테이션: 버튼 + 아이콘 렌더링
```

3계층이 각자 하나의 관심사만 담당:
- `theme.ts`: "테마 값을 읽고 쓴다" (DOM/localStorage)
- `useTheme.ts`: "React가 테마 변경을 감지한다" (구독/스냅샷)
- `ThemeToggle.tsx`: "사용자에게 토글 UI를 보여준다" (JSX)
