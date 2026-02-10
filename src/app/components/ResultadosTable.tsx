"use client";

import React from "react";
import { ButtonSecondary, cn } from "./CorporateUI";
import { Agente } from "./types";

type Props = {
  resultados: Agente[];
  emptyState: string;
  onSelect: (agente: Agente) => void;
  onFocusPlanilla?: (documento: string) => void;
  loading?: boolean;
};

function formatExcepcion(value: string | null) {
  if (!value) return "No";
  const normalized = value.trim();
  if (normalized === "0") return "No";
  if (normalized === "1") return "Sí";
  return normalized || "No";
}

export function ResultadosTable({
  resultados,
  emptyState,
  onSelect,
  onFocusPlanilla,
  loading = false,
}: Props) {
  return (
    <div className="border border-[#D0D7E2] bg-[#FFFFFF] rounded-lg flex-1 min-h-0 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#D0D7E2] flex items-center justify-between text-xs text-[#6B7280]">
        <p className="text-[15px] font-semibold text-[#1F2933] uppercase">
          Resultados
        </p>
        <p>
          {resultados.length
            ? `${resultados.length} registro(s)`
            : "0 registro(s)"}
        </p>
      </div>

      {/* Table container */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-4">
            <div className="space-y-3">
              <div className="skeleton h-4 rounded w-1/3" />
              <div className="skeleton h-4 rounded w-1/2" />
              <div className="skeleton h-4 rounded w-2/3" />
              <div className="flex gap-2 mt-4">
                <div className="skeleton h-8 rounded w-24" />
                <div className="skeleton h-8 rounded w-24" />
              </div>
              <div className="text-sm text-[#6B7280]">Preparando información...</div>
            </div>
          </div>
        ) : emptyState ? (
          <div className="px-4 py-4 text-sm text-[#6B7280]">{emptyState}</div>
        ) : (
          !!resultados.length && (
            <div className="h-full w-full">
              <table className="w-full border-collapse text-xs text-[#1F2933]">
                <thead className="sticky top-0 z-10 bg-black text-white text-[11px]">
                  <tr>
                    {[
                      "Documento",
                      "Nombre y Apellido",
                      "Empresa",
                      "Excepción",
                      "Última Presentación",
                      "Período",
                      "Nro Presentación",
                      "CUIL",
                      "CUIT Agente Retención",
                      "Descripción Agente Retención",
                      "Acción",
                    ].map((header, i) => (
                      <th
                        key={header}
                        className={cn(
                          "uppercase font-bold border border-black px-2 py-[4px] whitespace-nowrap",
                          i === 0 || i === 5 || i > 6
                            ? "text-right"
                            : "text-left"
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {resultados.map((a, idx) => (
                    <tr
                      key={a.documento}
                      className="hover:bg-[#F1F5F9] even:bg-[#FAFBFC]"
                    >
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap text-right tabular-nums">
                        {a.documento}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap">
                        {a.nya?.trim() || "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap">
                        {a.empresa?.trim() || "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap">
                        {formatExcepcion(a.excep)}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap">
                        {a.fechaWeb ?? "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap text-right tabular-nums">
                        {a.periodo}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap text-right tabular-nums">
                        {a.nroPres ?? "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap text-right tabular-nums">
                        {a.cuil ?? "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] whitespace-nowrap text-right tabular-nums">
                        {a.cuitAgentRent?.trim() || "-"}
                      </td>
                      <td
                        className="px-3 py-2 border-b border-[#D0D7E2] max-w-xs truncate"
                        title={a.descripAgentRent?.trim()}
                      >
                        {a.descripAgentRent?.trim() || "-"}
                      </td>
                      <td className="px-3 py-2 border-b border-[#D0D7E2] text-sm whitespace-nowrap">
                        <div className="flex items-center justify-end text-xs gap-2">
                          <ButtonSecondary
                            type="button"
                            onClick={() => {
                              onSelect(a);
                              onFocusPlanilla?.(a.documento);
                            }}
                          >
                            Ver Liquidación
                          </ButtonSecondary>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
