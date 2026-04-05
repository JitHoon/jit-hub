# 15. 문서화 품질 회고

## 개요

71개 .md 파일로 구성된 하네스 문서가 실제로 AI 코딩 품질을 향상시켰는지, 유지보수 부담은 적절한지 평가한다.

## 문서 인벤토리

| 카테고리 | 파일 수 | 핵심 문서 |
|----------|--------|----------|
| CLAUDE.md | 1 | 프로젝트 개요 + 조건부 로딩 |
| Rules | 1 | 코드 스타일 규칙 |
| Blueprint | 1 | 아키텍처 설계 (259줄) |
| Skills (SKILL.md) | 11 | 도메인별 지식 |
| Skill References | ~20 | 상세 레퍼런스 |
| Skill Examples | ~10 | 구현 예시 |
| Agents | 13 | 에이전트 정의 |
| Commands | 12 | 커맨드 정의 |
| 기타 | ~2 | 플래닝 문서 등 |

## 문서 효과 분석

### 실제로 효과가 높았던 문서

| 문서 | 효과 | 근거 |
|------|------|------|
| CLAUDE.md | ★★★★★ | 모든 세션에서 참조, 절대 규칙 준수율 높음 |
| code-style.md (Rules) | ★★★★★ | any 금지, Tailwind 강제 등 일관성 유지 |
| library-practices SKILL | ★★★★★ | Next.js 16, React 19 gotchas 방지 |
| content-pipeline SKILL | ★★★★☆ | 콘텐츠 추가 워크플로우 가이드 |
| clean-code SKILL | ★★★★☆ | 코드 구조화 패턴 일관성 |
| project-blueprint-v2 | ★★★★☆ | 아키텍처 결정 나침반 |

### 효과 판단이 어려운 문서

| 문서 | 이유 |
|------|------|
| harness-engineering SKILL | 메타 스킬 — 간접적 효과 |
| visual-spec SKILL | 활용 빈도 낮음 (MVP에서 시각 디자인 간소화) |
| task-planner SKILL | progress.md 작성 시에만 활용 |
| ui-ux-designer SKILL | 디자인 인터뷰 진행 시에만 활용 |

### 조건부 컨텍스트 로딩 효과

CLAUDE.md의 `<important if="...">` 패턴:

```markdown
<important if="콘텐츠 파이프라인 작업 시">
@.claude/skills/content-pipeline/SKILL.md 를 읽어라
</important>
```

**효과**: 8개 조건부 로딩 중 실제로 활성화된 비율 추정
- content-pipeline: 매우 자주 (콘텐츠 추가 시마다)
- graph-visualization: 자주 (그래프 작업 시)
- nextjs-patterns: 자주 (라우팅/SEO 작업 시)
- design-system: 보통 (UI 작업 시)
- library-practices: 자동 (PROACTIVELY)
- clean-code: 자동 (PROACTIVELY)
- playwright-testing: 가끔 (E2E 작성 시)
- visual-spec: 드물게

## 문서 유지보수 부담 평가

| 지표 | 값 | 평가 |
|------|------|------|
| 총 문서 수 | 71 | 관리 가능한 수준 |
| 평균 문서 길이 | ~50줄 | 간결 |
| 문서 업데이트 필요 빈도 | 낮음 | 대부분 안정적 |
| 코드와 문서 불일치 위험 | 낮음 | 문서가 원칙/패턴 중심 (구현 세부사항 X) |

### 유지보수 부담이 높은 문서
- library-practices: 라이브러리 버전 업데이트 시 갱신 필요
- project-blueprint: 아키텍처 변경 시 갱신 필요

### 유지보수 부담이 낮은 문서
- 에이전트/커맨드 정의: 구조가 안정적
- 코드 스타일 규칙: 프로젝트 수명 동안 거의 불변
- 스킬 문서: 도메인 지식이 코드 변경과 독립적

## 문서 품질 개선 기회

1. **활용도 추적**: 어떤 문서가 실제로 참조되었는지 로그 수집 (불가능할 수도)
2. **stale 문서 감지**: 마지막 수정일 기준 오래된 문서 식별
3. **중복 정보 제거**: 여러 문서에 산재된 동일 정보 통합
4. **검색 가능성**: 문서 간 상호 참조 링크 강화

## 다음 프로젝트를 위한 교훈

### Do's
- CLAUDE.md는 100줄 이내로 유지 (조건부 로딩으로 확장)
- Rules에 "절대 규칙"만 포함 (제안 수준은 Skill로)
- Skill은 PROACTIVELY 키워드로 자동 활성화 가능
- Blueprint는 "왜" 중심으로 작성 (구현 세부사항 X)

### Don'ts
- 모든 것을 문서화하려 하지 말 것 (코드가 스스로 설명하는 것은 제외)
- 구현 세부사항을 문서에 넣지 말 것 (코드와 불일치 위험)
- 문서 양이 목표가 되지 말 것 (효과가 목표)

## 액션 아이템

- [ ] 활용도 낮은 문서 식별 및 축소/통합 검토
- [ ] library-practices 문서 최신 상태 확인
- [ ] 문서 작성 시작 체크리스트 (다음 프로젝트용)
- [ ] 조건부 컨텍스트 로딩 패턴을 다음 프로젝트 템플릿에 포함
