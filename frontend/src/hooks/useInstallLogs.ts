import { useQuery } from "@tanstack/react-query";
import { getInstallLogs } from "@/api/installations";
import type { InstallLog } from "@/lib/types";

/**
 * Polls the installation lifecycle logs (app_logs) every 1.5s while a dialog is
 * open for `installationId`. Returns the full ordered list (for the "View logs"
 * panel) plus `currentStatus` — the latest event — to show as a live status line
 * under the progress bar.
 *
 * Pass `null` to stop polling (e.g. when the dialog closes).
 */
export function useInstallLogs(installationId: number | null) {
  const enabled = installationId !== null;
  const query = useQuery({
    queryKey: ["install-logs", installationId],
    queryFn: () => getInstallLogs(installationId!),
    enabled,
    refetchInterval: enabled ? 1500 : false,
  });

  const logs: InstallLog[] = query.data ?? [];
  const currentStatus: InstallLog | null = logs.length > 0 ? logs[logs.length - 1] : null;
  return { logs, currentStatus, ...query };
}
