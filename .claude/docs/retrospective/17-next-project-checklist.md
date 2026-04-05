# 17. 다음 프로젝트 체크리스트

## 개요

회고 1~16번에서 도출한 핵심 인사이트를 다음 프로젝트 Day 1부터 적용할 체크리스트로 정리한다.

---

## Day 0: 프로젝트 시작 전

### 기획
- [ ] MVP 스코프 명확히 정의 (v1→v2 전환 방지)
- [ ] "절대 하지 않을 것" 목록 작성 (스코프 크리프 방지)
- [ ] 핵심 기술 결정 3~5개를 Day 1에 완료할 계획 수립

### 하네스 준비
- [ ] 하네스 템플릿 패키지에서 프로젝트에 맞게 커스터마이즈
- [ ] CLAUDE.md 초안 작성 (100줄 이내, 조건부 컨텍스트 로딩)
- [ ] settings.json 기본 권한/훅 설정
- [ ] code-style Rules 작성 (TypeScript strict, 스타일링 규칙)

---

## Day 1: 프로젝트 초기화

### 인프라
- [ ] TypeScript strict + noUncheckedIndexedAccess 활성화
- [ ] ESLint + Prettier + husky pre-commit 훅 설정
- [ ] CI (GitHub Actions) 기본 구성
- [ ] 테스트 인프라 설정 (Vitest + Playwright)

### 아키텍처 결정
- [ ] ADR(Architecture Decision Record) 형식 도입
- [ ] 디렉토리 구조 확정 (feature-first colocalization)
- [ ] 디자인 토큰 정의 (색상, 타이포, 스페이싱, 애니메이션)
- [ ] blueprint 문서 작성 (핵심 결정 근거 포함)

### 하네스
- [ ] 핵심 Skills 정의 (clean-code, library-practices는 범용)
- [ ] PostToolUse 훅 설정 (TypeScript + ESLint 자동 검사)
- [ ] PreToolUse 훅 설정 (main 브랜치 보호)
- [ ] 모든 Agent에 maxTurns 설정

---

## Day 2~: 개발 중

### 코드 품질
- [ ] any 사용 금지 → unknown 또는 구체적 타입
- [ ] 인라인 style 금지 → Tailwind 클래스
- [ ] 컴포넌트 파일에 헬퍼 함수 선언 금지 → 훅/lib으로 이동
- [ ] 유닛 테스트를 기능 구현과 동시에 작성 (나중에 하면 안 함)

### AI 협업
- [ ] 프롬프트에 구체적 파일 경로 + 변경 내용 명시
- [ ] 보일러플레이트/패턴 반복은 AI에게 위임
- [ ] 기획/UX/콘텐츠 결정은 직접 수행
- [ ] 반복 수정이 잦은 영역 발견 시 즉시 Skill 문서 보강

### 문서화
- [ ] 코드가 스스로 설명하는 것은 문서화 금지
- [ ] "왜(Why)" 결정을 했는지만 문서에 기록
- [ ] Gotchas 발견 시 즉시 해당 Skill 문서에 추가

### 테스트
- [ ] 유닛 테스트: 비즈니스 로직, 유틸리티 함수 중심
- [ ] E2E 테스트: 주요 사용자 플로우 중심
- [ ] 접근성 테스트: axe-core 자동 검사 포함
- [ ] 성능 테스트: Lighthouse CI 베이스라인 설정

---

## 배포 전

### SEO (웹 프로젝트인 경우)
- [ ] 메타데이터 (title, description, OG, Twitter Card)
- [ ] JSON-LD 구조화 데이터
- [ ] Sitemap + Robots.txt
- [ ] Canonical URL
- [ ] Google Rich Results Test 검증

### 접근성
- [ ] Lighthouse 접근성 90+ 확인
- [ ] 키보드 전용 탐색 수동 테스트
- [ ] 색상 대비 WCAG AA 검증
- [ ] prefers-reduced-motion 지원

### 성능
- [ ] Lighthouse 성능 90+ 확인
- [ ] 번들 분석 (불필요한 의존성 제거)
- [ ] 이미지/폰트 최적화 확인
- [ ] Core Web Vitals 확인

---

## 프로젝트 완료 후

### 회고
- [ ] 정량 대시보드 작성 (커밋, PR, LOC, 기간)
- [ ] 이 체크리스트 자체를 회고하여 업데이트
- [ ] 범용 모듈 추출 대상 식별
- [ ] 다음 프로젝트에 적용할 교훈 3가지 명시

### 하네스 개선
- [ ] 활용도 낮은 문서 식별 및 축소
- [ ] 새로 발견한 gotchas 추가
- [ ] 하네스 템플릿 업데이트

---

## 핵심 원칙 (전 과정에 걸쳐)

1. **요청 범위만 수행**: 요청받은 것만 하고 멈출 것
2. **점진적 복잡도**: 간단한 것부터 시작, 패턴 확립 후 복잡도 증가
3. **빌드 타임 검증**: 가능한 모든 검증을 빌드 타임으로
4. **하네스가 곧 프롬프트**: 매번 반복할 규칙은 시스템 레벨로
5. **"무엇을"은 내가, "어떻게"는 AI에게**: 위임의 경계 지키기
6. **문서는 "왜"만**: 코드가 설명하는 것은 문서화 금지
7. **첫 주 초반에 핵심 결정**: Day 1~3에 아키텍처 결정 집중
