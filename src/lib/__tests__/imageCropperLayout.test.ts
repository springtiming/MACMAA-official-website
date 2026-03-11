import { describe, expect, it } from "vitest";
import { getCropperViewportBounds } from "../imageCropperLayout";

describe("imageCropperLayout", () => {
  it("computes bounded stage size from viewport and aspect", () => {
    const bounds = getCropperViewportBounds(900, 16 / 9);

    expect(bounds.stageMaxHeight).toBe(640);
    expect(bounds.stageMaxWidth).toBe(1137);
  });

  it("clamps stage size for very small viewports", () => {
    const bounds = getCropperViewportBounds(320, 16 / 9);

    expect(bounds.stageMaxHeight).toBe(220);
    expect(bounds.stageMaxWidth).toBe(391);
  });

  it("falls back to safe defaults for invalid inputs", () => {
    const bounds = getCropperViewportBounds(Number.NaN, 0);

    expect(bounds.stageMaxHeight).toBe(640);
    expect(bounds.stageMaxWidth).toBe(1137);
  });
});
