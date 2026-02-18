import { describe, it, expect } from "bun:test";
import { decodeHtmlEntities, escapeLike } from "../utils";

describe("decodeHtmlEntities", () => {
  it("decodes &lt; and &gt; into angle brackets", () => {
    expect(decodeHtmlEntities("&lt;font&gt;")).toBe("<font>");
  });

  it("decodes &#39; into a single quote", () => {
    expect(decodeHtmlEntities("color=&#39;red&#39;")).toBe("color='red'");
  });

  it("decodes &quot; into a double quote", () => {
    expect(decodeHtmlEntities("&quot;hello&quot;")).toBe('"hello"');
  });

  it("decodes &amp; last so &amp;lt; becomes &lt; not <", () => {
    expect(decodeHtmlEntities("&amp;lt;")).toBe("&lt;");
  });

  it("handles a full encoded HTML tag", () => {
    const input = "&lt;font color=&#39;sienna&#39;&gt;I&lt;/font&gt;";
    expect(decodeHtmlEntities(input)).toBe("<font color='sienna'>I</font>");
  });

  it("leaves already-raw HTML unchanged", () => {
    const html = "<div style='margin-left:1em'>море</div>";
    expect(decodeHtmlEntities(html)).toBe(html);
  });

  it("returns empty string unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });

  it("handles multiple entity types in one string", () => {
    expect(decodeHtmlEntities("&lt;p&gt;&quot;test&quot;&lt;/p&gt;")).toBe(
      '<p>"test"</p>',
    );
  });
});

// ─── escapeLike ───────────────────────────────────────────────────────────────

describe("escapeLike", () => {
  it("escapes backslash", () => {
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("escapes percent sign", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });

  it("escapes underscore", () => {
    expect(escapeLike("a_b")).toBe("a\\_b");
  });

  it("escapes multiple special characters in one string", () => {
    expect(escapeLike("a%b_c\\d")).toBe("a\\%b\\_c\\\\d");
  });

  it("leaves a plain string unchanged", () => {
    expect(escapeLike("адыгэ")).toBe("адыгэ");
  });

  it("returns empty string unchanged", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes leading percent (wildcard at start)", () => {
    expect(escapeLike("%prefix")).toBe("\\%prefix");
  });

  it("escapes trailing percent (wildcard at end)", () => {
    expect(escapeLike("suffix%")).toBe("suffix\\%");
  });

  it("handles a string that is only special characters", () => {
    expect(escapeLike("%_%")).toBe("\\%\\_\\%");
  });
});
