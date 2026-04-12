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
