import { describe, it, expect } from "vitest";
import { fixEmphasisEdgeCases } from "./fix-emphasis";

describe("fixEmphasisEdgeCases", () => {
  it("구두점+**+한글 패턴을 <strong>으로 변환한다", () => {
    expect(fixEmphasisEdgeCases('**"텍스트"**는')).toBe(
      '<strong>"텍스트"</strong>는',
    );
  });

  it("괄호+**+한글 패턴을 변환한다", () => {
    expect(fixEmphasisEdgeCases("**표면(surface)**을")).toBe(
      "<strong>표면(surface)</strong>을",
    );
  });

  it("닫는 ** 뒤가 공백이면 변환하지 않는다", () => {
    expect(fixEmphasisEdgeCases('**"텍스트"** 다음')).toBe('**"텍스트"** 다음');
  });

  it("닫는 ** 앞이 구두점이 아니면 변환하지 않는다", () => {
    expect(fixEmphasisEdgeCases("**일반텍스트**를")).toBe("**일반텍스트**를");
  });

  it("코드 블록 내부는 변환하지 않는다", () => {
    const input = '```\n**"코드"**는\n```';
    expect(fixEmphasisEdgeCases(input)).toBe(input);
  });

  it("인라인 코드 내부는 변환하지 않는다", () => {
    const input = '`**"코드"**는`';
    expect(fixEmphasisEdgeCases(input)).toBe(input);
  });

  it("여러 패턴을 한 번에 처리한다", () => {
    const input = '**"A"**는 그리고 **"B"**를';
    expect(fixEmphasisEdgeCases(input)).toBe(
      '<strong>"A"</strong>는 그리고 <strong>"B"</strong>를',
    );
  });
});
