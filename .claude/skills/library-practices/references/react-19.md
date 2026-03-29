# React 19 베스트 프랙티스

> 소스: [Vercel Labs react-best-practices](https://github.com/vercel-labs/agent-skills), [secondsky/nextjs](https://github.com/secondsky/claude-skills)

## React 19 신규 API

### `use()` 훅
```tsx
// ✅ Promise 소비 (Suspense 필요)
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// ✅ Context 소비 (useContext 대체)
function ThemeButton() {
  const theme = use(ThemeContext);
  return <button className={theme}>;
}
```

### `ref` as prop (forwardRef 불필요)
```tsx
// ✅ React 19
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// ❌ React 18 방식 (불필요)
const Input = forwardRef<HTMLInputElement>((props, ref) => { ... });
```

### Actions & Form 패턴
```tsx
// useActionState: 폼 상태 + 서버 액션
const [state, action, isPending] = useActionState(serverAction, initialState);

// useOptimistic: 낙관적 업데이트
const [optimisticItems, addOptimistic] = useOptimistic(items);

// useFormStatus: 폼 제출 상태 (자식 컴포넌트에서)
const { pending } = useFormStatus();
```

## Server Components 규칙 (App Router)

- **기본이 Server Component** — `'use client'` 없으면 서버에서 실행
- Server Component에서 `useState`, `useEffect`, `useRef` 등 훅 사용 불가
- `async` Server Component 가능 — 직접 `await` 사용
- 클라이언트 컴포넌트는 Server Component를 import할 수 없음 (children으로 전달)

## 성능 CRITICAL 규칙

### Waterfall 제거
```tsx
// ❌ 순차 요청 (waterfall)
const user = await getUser();
const posts = await getPosts(user.id);

// ✅ 병렬 요청
const [user, posts] = await Promise.all([getUser(), getPosts(userId)]);
```

### 번들 최적화
- `next/dynamic`으로 무거운 컴포넌트 지연 로드
- barrel file (`index.ts` re-export) 회피 — tree-shaking 방해
- `React.lazy()` 대신 `next/dynamic` 사용 (Next.js 환경)

### 서버 사이드 중복 요청 제거
```tsx
// React.cache()로 같은 요청 자동 중복 제거 (서버 전용)
const getUser = React.cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

### 리렌더링 최적화
- 인라인 컴포넌트 정의 금지 (렌더 함수 안에서 컴포넌트 선언)
- `useMemo`/`useCallback` — 실제 성능 문제 있을 때만 사용
- `useTransition`: 비긴급 업데이트를 트랜지션으로 래핑

## 이 프로젝트 규칙

- 함수형 컴포넌트 only (class 컴포넌트 금지)
- Props는 `interface`로 정의 (`type`은 유니온/인터섹션에만)
- 컴포넌트 파일명 = PascalCase
