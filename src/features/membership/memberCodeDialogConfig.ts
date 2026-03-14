export type MemberCodeDialogLanguage = "zh" | "en";

export const MEMBER_CODE_DIALOG_MAX_HEIGHT = "calc(100dvh - 2rem)";

export const MEMBER_CODE_DIALOG_CONTENT_CLASS =
  "flex flex-col overflow-hidden p-0 sm:max-w-3xl";

export const MEMBER_CODE_DIALOG_HEADER_CLASS =
  "flex-shrink-0 border-b bg-[#F5EFE6] px-6 py-4 text-left";

export const MEMBER_CODE_DIALOG_SCROLL_AREA_CLASS =
  "min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 text-sm sm:text-base";

export const MEMBER_CODE_DIALOG_FOOTER_CLASS =
  "flex-shrink-0 border-t bg-white px-6 py-4";

export const MEMBER_CODE_DIALOG_CLOSE_BUTTON_CLASS =
  "w-full px-4 py-2 bg-[#2B5F9E] text-sm font-medium text-white rounded-lg hover:bg-[#234a7e] transition-colors";

export function getMemberCodeDialogCopy(language: MemberCodeDialogLanguage) {
  if (language === "zh") {
    return {
      closeButtonLabel: "关闭",
      description: "请滚动阅读完整会员守则，阅读完毕后可通过顶部关闭按钮或底部关闭按钮退出。",
    };
  }

  return {
    closeButtonLabel: "Close",
    description:
      "Scroll to review the full member code of conduct, then use the top or bottom close action to exit the dialog.",
  };
}
