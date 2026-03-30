# 컴포넌트 분리 패턴

## 분리가 필요한 신호

| 신호 | 예시 | 조치 |
|------|------|------|
| 파일 150줄 초과 | 긴 컴포넌트 | 훅 추출 또는 하위 컴포넌트 분리 |
| 이름에 "And" 필요 | `UserProfileAndSettings` | 2개 컴포넌트로 분리 |
| 내부 상태 3단계 전달 | prop → child → grandchild | Context 또는 컴포지션 |
| 독립 테스트 가능한 섹션 | 차트 영역, 폼 영역 | 별도 컴포넌트 |
| 조건부 렌더링 10줄 이상 | 복잡한 삼항/&&체인 | 별도 컴포넌트로 추출 |

## 컴포지션 패턴

### Children 패턴 (가장 단순)

```tsx
// 레이아웃과 콘텐츠 분리
interface PanelProps {
  children: React.ReactNode;
}

function Panel({ children }: PanelProps) {
  return <div className="rounded-lg border border-border p-4">{children}</div>;
}
```

### Slots 패턴 (고정 구조, 유연한 콘텐츠)

```tsx
interface PageLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

function PageLayout({ header, sidebar, children }: PageLayoutProps) {
  return (
    <div className="grid grid-cols-[250px_1fr]">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
```

### Compound Components (공유 상태)

```tsx
// 형제 컴포넌트가 암묵적으로 상태 공유
<Tabs defaultValue="a">
  <Tabs.List>
    <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
    <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">Content A</Tabs.Content>
  <Tabs.Content value="b">Content B</Tabs.Content>
</Tabs>
```

## Open/Closed 원칙

```tsx
// ❌ boolean 플래그로 변형 (수정에 열림)
<Card isCompact isHighlighted isBordered />

// ✅ 컴포지션으로 변형 (확장에 열림)
<Card className="p-2">
  <HighlightBorder>
    <CardContent />
  </HighlightBorder>
</Card>
```

## Colocation (배치 원칙)

Kent C. Dodds의 Colocation 원칙:

1. **한 컴포넌트만 사용** → 같은 파일 (단, 컴포넌트 외부 헬퍼는 예외)
2. **형제 컴포넌트가 공유** → 부모 디렉토리
3. **피처 간 공유** → 공유 디렉토리 (`src/components/`, `src/hooks/`)
4. **전역** → `src/lib/`

이 프로젝트는 flat-by-type 구조이므로 3~4단계가 기본이다.
프로젝트가 커지면 feature-based 구조로 전환 신호를 주시:
→ 하나의 기능 작업에 5개 이상 디렉토리를 열어야 할 때
