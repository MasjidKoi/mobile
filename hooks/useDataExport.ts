import { useCallback, useRef, useState } from "react";

import { exportMyData } from "@/lib/account/export";

export type ExportState = "idle" | "loading" | "error";

/**
 * Drives the "Download my data" flow with progress + retryable-error states
 * (PRD 09 #37). Shared by the Privacy screen and the deletion consequences
 * screen's inline export offer. Cancel ignores the in-flight result.
 */
export function useDataExport() {
  const [state, setState] = useState<ExportState>("idle");
  const cancelled = useRef(false);

  const run = useCallback(async () => {
    cancelled.current = false;
    setState("loading");
    try {
      await exportMyData();
      if (!cancelled.current) setState("idle");
    } catch {
      if (!cancelled.current) setState("error");
    }
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    setState("idle");
  }, []);

  return { state, run, cancel };
}
