# 12. 에러 핸들링 및 장애 대응 패턴

## 개요

프로젝트에서 경험한 주요 버그들의 발견→해결 과정을 복기하고, 에러 핸들링 패턴을 평가한다.

## 3단계 ErrorBoundary 구조

```
Layer 1: global-error.tsx (앱 전체 — layout.tsx 포함 에러)
  └── Layer 2: error.tsx (페이지 레벨 — 개별 라우트 에러)
        └── Layer 3: FeatureBoundary (피처 레벨 — 컴포넌트 단위 격리)
              = ErrorBoundary + Suspense + Skeleton
```

### 각 레이어 역할

| 레이어 | 트리거 | 대응 |
|--------|--------|------|
| global-error | 레이아웃 오류, 치명적 에러 | 전체 페이지 리셋 UI |
| error.tsx | 라우트 컴포넌트 에러 | 재시도 버튼 + 에러 메시지 |
| FeatureBoundary | 개별 피처 에러 | Skeleton 폴백 + 에러 카드 |

### 평가: ★★★★★
- 에러가 상위로 전파되지 않는 격리 구조
- FeatureBoundary가 ErrorBoundary + Suspense + Skeleton을 통합하여 사용 편의성 높음
- WebGL 미지원 시 ErrorCard 폴백이 정상적으로 동작

## 주요 버그 해결 사례

### Case 1: React Hydration 버그 (4커밋)

**증상**: 테마 전환 시 화면이 깜빡이거나, 서버/클라이언트 테마 불일치

**해결 과정**:
```
1. e846048 — React 하이드레이션이 테마 클래스를 덮어쓰는 문제 발견
   → suppressHydrationWarning 추가 (임시 조치)

2. 18f82c9 — useEffect를 useLayoutEffect로 교체
   → 페인트 전에 테마 적용하여 깜빡임 방지

3. 18fa6ee — 폰트 변수를 body로 이동
   → html 태그의 속성 변경 최소화

4. c977ec4 — applyThemeToDOM 함수 분리
   → hydration 시 localStorage 덮어쓰기 방지
```

**학습**: SSR + 테마 전환은 본질적으로 복잡. getServerSnapshot으로 서버 초기값을 명시하고, useLayoutEffect로 페인트 전에 DOM 업데이트해야 함.

### Case 2: WebGL 폴백 처리

**증상**: WebGL 미지원 브라우저에서 3D 그래프 크래시

**해결**:
```
1. 6fbb114 — useWebGLCheck 훅 추가
   → WebGL 지원 여부 사전 확인
   → 미지원 시 ErrorCard 폴백 UI 렌더링

2. ca3bbad — E2E 테스트 추가
   → WebGL 폴백 시나리오 자동 검증
```

**학습**: 방어적 코딩의 적절한 수준 — WebGL처럼 환경 의존적인 기능은 반드시 사전 체크 + 폴백 필요.

### Case 3: three.js 캐시 안전성

**증상**: nodeThreeObject 캐시 히트 후 mesh가 null일 수 있음

**해결**:
```
36d84cf — null 안전성 강화 + rebuild 시 선택 색상 복원
```

**학습**: 캐싱 로직에서는 항상 캐시 무효화/갱신 시나리오를 고려해야 함.

## 에러 핸들링 패턴 평가

| 패턴 | 적용 수준 | 평가 |
|------|----------|------|
| ErrorBoundary 중첩 | 3단계 완비 | ★★★★★ |
| 환경 체크 (WebGL) | 구현 완료 | ★★★★★ |
| 런타임 검증 (Zod) | 빌드 타임 완비 | ★★★★★ |
| null 안전성 | 부분적 | ★★★★☆ |
| 네트워크 에러 처리 | 해당 없음 (정적) | - |
| 사용자 피드백 | ErrorCard UI | ★★★★☆ |
| 에러 로깅 | 미구현 | ★★☆☆☆ |
| 에러 복구 | 재시도 버튼 | ★★★☆☆ |

## 방어적 코딩 vs 과잉 방어 구분

### 적절한 방어
- WebGL 사전 체크 → 환경 의존적 기능
- Zod 스키마 검증 → 외부 데이터(마크다운 프론트매터)
- ErrorBoundary → 예측 불가능한 렌더링 에러

### 과잉 방어 주의
- 내부 함수 간 타입 검증 → TypeScript strict가 이미 보장
- null 체크 남발 → noUncheckedIndexedAccess로 컴파일러가 강제

## 액션 아이템

- [ ] 에러 로깅 시스템 도입 검토 (Sentry 등)
- [ ] 에러 복구 UX 개선 (재시도 횟수 제한, 지수 백오프)
- [ ] hydration 버그 패턴을 library-practices Skill에 추가
- [ ] WebGL 체크 패턴을 범용 "환경 체크" 유틸로 추출 검토
