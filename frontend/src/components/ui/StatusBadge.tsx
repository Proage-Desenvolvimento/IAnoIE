import { Badge as BadgeComponent } from "@/components/ui/Badge";

type InstallationStatus = "pending" | "installing" | "running" | "stopped" | "error" | "uninstalling";

const statusConfig: Record<InstallationStatus, { variant: "default" | "secondary" | "success" | "warning" | "danger" | "info"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  installing: { variant: "info", label: "Installing" },
  running: { variant: "success", label: "Running" },
  stopped: { variant: "secondary", label: "Stopped" },
  error: { variant: "danger", label: "Error" },
  uninstalling: { variant: "warning", label: "Uninstalling" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as InstallationStatus] || { variant: "default" as const, label: status };
  return (
    <BadgeComponent variant={config.variant} dot className={className}>
      {config.label}
    </BadgeComponent>
  );
}
