import { describe, expect, it } from "vitest";
import {
  MEMBER_CODE_DIALOG_CONTENT_CLASS,
  MEMBER_CODE_DIALOG_MAX_HEIGHT,
  MEMBER_CODE_DIALOG_SCROLL_AREA_CLASS,
  getMemberCodeDialogCopy,
} from "../memberCodeDialogConfig";

describe("memberCodeDialogConfig", () => {
  it("keeps the dialog inside the viewport and makes the body scrollable", () => {
    expect(MEMBER_CODE_DIALOG_MAX_HEIGHT).toBe("calc(100dvh - 2rem)");
    expect(MEMBER_CODE_DIALOG_CONTENT_CLASS).toContain("overflow-hidden");
    expect(MEMBER_CODE_DIALOG_SCROLL_AREA_CLASS).toContain("min-h-0");
    expect(MEMBER_CODE_DIALOG_SCROLL_AREA_CLASS).toContain("overflow-y-auto");
  });

  it("provides a dedicated close action in both languages", () => {
    expect(getMemberCodeDialogCopy("zh")).toMatchObject({
      closeButtonLabel: "关闭",
    });
    expect(getMemberCodeDialogCopy("en")).toMatchObject({
      closeButtonLabel: "Close",
    });
  });
});
