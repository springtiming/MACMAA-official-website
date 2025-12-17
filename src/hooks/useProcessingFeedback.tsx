import { useCallback, useState } from "react";
import type { ProcessingState } from "../components/ProcessingOverlay";

type FeedbackMessages = {
  processingTitle: string;
  processingMessage?: string;
  successTitle: string;
  successMessage?: string;
  errorTitle: string;
  errorMessage?: string;
};

type RunWithFeedbackOptions = {
  onError?: (error: unknown) => void;
};

export function useProcessingFeedback() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const setFeedback = useCallback(
    (nextState: ProcessingState, nextTitle?: string, nextMessage?: string) => {
      setState(nextState);
      setTitle(nextTitle ?? "");
      setMessage(nextMessage ?? "");
    },
    []
  );

  const runWithFeedback = useCallback(
    async <T,>(
      messages: FeedbackMessages,
      task: () => Promise<T>,
      options?: RunWithFeedbackOptions
    ) => {
      setFeedback(
        "processing",
        messages.processingTitle,
        messages.processingMessage
      );
      try {
        const result = await task();
        setFeedback("success", messages.successTitle, messages.successMessage);
        return result;
      } catch (error) {
        setFeedback("error", messages.errorTitle, messages.errorMessage);
        options?.onError?.(error);
        throw error;
      }
    },
    [setFeedback]
  );

  const reset = useCallback(() => {
    setState("idle");
    setTitle("");
    setMessage("");
  }, []);

  const showProcessing = useCallback(
    (
      processing: Pick<
        FeedbackMessages,
        "processingTitle" | "processingMessage"
      >
    ) =>
      setFeedback(
        "processing",
        processing.processingTitle,
        processing.processingMessage
      ),
    [setFeedback]
  );

  const showSuccess = useCallback(
    (success: Pick<FeedbackMessages, "successTitle" | "successMessage">) =>
      setFeedback("success", success.successTitle, success.successMessage),
    [setFeedback]
  );

  const showError = useCallback(
    (error: Pick<FeedbackMessages, "errorTitle" | "errorMessage">) =>
      setFeedback("error", error.errorTitle, error.errorMessage),
    [setFeedback]
  );

  return {
    state,
    title,
    message,
    runWithFeedback,
    showProcessing,
    showSuccess,
    showError,
    reset,
  };
}
















