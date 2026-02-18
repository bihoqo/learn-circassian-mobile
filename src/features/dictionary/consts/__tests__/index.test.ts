import { describe, it, expect } from "bun:test";
import { toPalochka, LANGUAGE_DISPLAY_MAP, MIN_CONTAINS_CHARS } from "../index";

describe("toPalochka", () => {
  it("converts digit 1 to Cyrillic palochka Ӏ", () => {
    expect(toPalochka("1эдыгъу")).toBe("Ӏэдыгъу");
  });

  it("converts all occurrences of 1 in a string", () => {
    expect(toPalochka("1э1у")).toBe("ӀэӀу");
  });

  it("leaves strings without 1 unchanged", () => {
    expect(toPalochka("адыгэ")).toBe("адыгэ");
  });

  it("returns an empty string unchanged", () => {
    expect(toPalochka("")).toBe("");
  });

  it("does not affect the Roman numeral I", () => {
    expect(toPalochka("I")).toBe("I");
  });

  it("converts 1 inside HTML content", () => {
    expect(toPalochka("<b>1эпэ</b>")).toBe("<b>Ӏэпэ</b>");
  });
});

describe("LANGUAGE_DISPLAY_MAP", () => {
  it("maps Ady to West Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ady"]).toBe("West Circassian");
  });

  it("maps Kbd to East Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Kbd"]).toBe("East Circassian");
  });

  it("maps Ady/Kbd to West & East Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ady/Kbd"]).toBe("West & East Circassian");
  });

  it("maps Ru to Russian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ru"]).toBe("Russian");
  });

  it("maps En to English", () => {
    expect(LANGUAGE_DISPLAY_MAP["En"]).toBe("English");
  });

  it("maps Tr to Turkish", () => {
    expect(LANGUAGE_DISPLAY_MAP["Tr"]).toBe("Turkish");
  });

  it("maps Ar to Arabic", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ar"]).toBe("Arabic");
  });

  it("maps He to Hebrew", () => {
    expect(LANGUAGE_DISPLAY_MAP["He"]).toBe("Hebrew");
  });
});

describe("MIN_CONTAINS_CHARS", () => {
  it("is set to 3", () => {
    expect(MIN_CONTAINS_CHARS).toBe(3);
  });

  it("is a positive integer", () => {
    expect(MIN_CONTAINS_CHARS).toBeGreaterThan(0);
    expect(Number.isInteger(MIN_CONTAINS_CHARS)).toBe(true);
  });
});
