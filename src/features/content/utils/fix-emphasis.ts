/**
 * CommonMark emphasis edge case 전처리
 *
 * CommonMark 스펙: closing ** 앞이 Unicode 구두점이고 뒤가 구두점/공백이 아니면
 * right-flanking delimiter run 자격을 얻지 못해 bold가 닫히지 않는다.
 * 예: **"텍스트"**는 → ** 가 닫히지 않아 그대로 노출
 *
 * 해결: 해당 패턴을 <strong> HTML 태그로 변환하여 파서 우회
 */
export function fixEmphasisEdgeCases(source: string): string {
  return source
    .split(/(```[\s\S]*?```|`[^`\n]+`)/)
    .map((segment, index) => {
      if (index % 2 === 1) return segment;
      return segment.replace(
        /\*\*((?:[^*]|\*(?!\*))+\p{P})\*\*(?=[^\s\p{P}])/gu,
        "<strong>$1</strong>",
      );
    })
    .join("");
}
