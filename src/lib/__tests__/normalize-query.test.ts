import { describe, it, expect } from "bun:test";
import { normalizeQuery } from "../utils";

describe("normalizeQuery — palochka conversion", () => {
  it("converts palochka Ӏ (U+04C0) to digit '1'", () => {
    expect(normalizeQuery("Ӏэдыгъу")).toBe("1эдыгъу");
  });

  it("converts multiple palochkas in one string", () => {
    expect(normalizeQuery("ӀэӀу")).toBe("1э1у");
  });

  it("leaves digit '1' unchanged (already normalised)", () => {
    expect(normalizeQuery("1эдыгъу")).toBe("1эдыгъу");
  });
});

describe("normalizeQuery — lowercasing", () => {
  it("lowercases Cyrillic uppercase letters", () => {
    expect(normalizeQuery("АДЫГЭ")).toBe("адыгэ");
  });

  it("lowercases a mixed-case Cyrillic string", () => {
    expect(normalizeQuery("Адыгэ")).toBe("адыгэ");
  });

  it("lowercases Latin uppercase letters", () => {
    expect(normalizeQuery("HELLO")).toBe("hello");
  });

  it("applies both palochka conversion and lowercasing together", () => {
    expect(normalizeQuery("ӀЭдыгъу")).toBe("1эдыгъу");
  });
});

describe("normalizeQuery — edge cases", () => {
  it("returns empty string unchanged", () => {
    expect(normalizeQuery("")).toBe("");
  });

  it("leaves a pure-Cyrillic lowercase string unchanged", () => {
    expect(normalizeQuery("адыгэ")).toBe("адыгэ");
  });

  it("leaves digits other than '1' unchanged", () => {
    expect(normalizeQuery("3псы")).toBe("3псы");
  });

  it("handles a string with only palochkas", () => {
    expect(normalizeQuery("ӀӀӀ")).toBe("111");
  });

  it("leaves spaces and punctuation unchanged", () => {
    expect(normalizeQuery("Псы-псы")).toBe("псы-псы");
  });
});
