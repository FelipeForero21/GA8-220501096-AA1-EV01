/**
 * Pruebas unitarias - Componente AlertBadge
 * Verifica el renderizado correcto según la severidad
 */

import { render, screen } from "@testing-library/react";
import { AlertBadge } from "@/components/alertas/alert-badge";

describe("AlertBadge", () => {
  it("debe mostrar 'Información' para severidad INFO", () => {
    render(<AlertBadge severity="INFO" />);
    expect(screen.getByText("Información")).toBeInTheDocument();
  });

  it("debe mostrar 'Advertencia' para severidad WARNING", () => {
    render(<AlertBadge severity="WARNING" />);
    expect(screen.getByText("Advertencia")).toBeInTheDocument();
  });

  it("debe mostrar 'Crítica' para severidad CRITICAL", () => {
    render(<AlertBadge severity="CRITICAL" />);
    expect(screen.getByText("Crítica")).toBeInTheDocument();
  });

  it("debe aplicar estilos rojos para severidad CRITICAL", () => {
    render(<AlertBadge severity="CRITICAL" />);
    const badge = screen.getByText("Crítica");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-800");
  });
});
