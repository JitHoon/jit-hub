---
description: 회고 액션 아이템을 순서대로 진행하고 완료 상태를 업데이트합니다
---

## 실행 절차

1. `.claude/docs/retrospective/retro-actions.md`를 읽고 첫 번째 `[ ]` (미완료) 항목을 찾아라
2. 해당 항목의 "원본" 컬럼 번호로 archive 원본 문서를 찾아 읽어라:
   - 숫자 2자리 (예: `02`) → `.claude/docs/retrospective/archive/XX-*.md`
   - `deep/NN` (예: `deep/03`) → `.claude/docs/retrospective/archive/deep-dives/NN-*.md`
3. 원본 문서에서 해당 항목과 관련된 맥락(문제 배경, 권장 방향, 참고 코드)을 추출하라
4. 사용자에게 다음을 안내하라:
   - **항목 번호 / 작업 내용 / 카테고리** (즉시·단기·중기·학습·심화)
   - **배경**: 원본 문서에서 왜 이 항목이 나왔는지
   - **실행 가이드**: 구체적으로 어떻게 하면 되는지 단계별 안내
5. AskUserQuestion으로 진행 방식을 확인하라:
   - "바로 실행" — 함께 작업 시작
   - "건너뛰기" — 다음 미완료 항목으로 이동
   - "중단" — 회고 세션 종료
6. "바로 실행" 선택 시:
   - 코드 변경 항목 → 코드를 직접 수정하라
   - 외부 확인 항목 (Lighthouse, Search Console 등) → 실행 방법을 안내하고 사용자 결과를 받아라
   - 학습/습관 항목 → 인사이트를 정리하고 CLAUDE.md 또는 Skill 문서에 반영하라
7. 작업 완료 후 `retro-actions.md`에서 해당 항목의 `[ ]`를 `[x]`로 변경하라
8. AskUserQuestion으로 "다음 항목 진행?" 을 물어라. "예"면 1번으로 돌아가라
