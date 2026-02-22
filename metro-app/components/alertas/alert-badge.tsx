/**
 * Componente de badge de alerta
 * Server Component: muestra la severidad de una alerta con color
 * Se implementará completamente en el módulo de Notificaciones
 */

import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  severity: "INFO" | "WARNING" | "CRITICAL";
}

/** Mapeo de severidad a estilos de color */
const severityStyles = {
  INFO: "bg-blue-100 text-blue-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-red-100 text-red-800",
};

/** Mapeo de severidad a texto en español */
const severityLabels = {
  INFO: "Información",
  WARNING: "Advertencia",
  CRITICAL: "Crítica",
};

export function AlertBadge({ severity }: AlertBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        severityStyles[severity]
      )}
    >
      {severityLabels[severity]}
    </span>
  );
}
