"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanillaTable } from "./PlanillaTable";
import {
  AlertBox,
  ButtonPrimary,
  ButtonSecondary,
  FilterBar,
  PageShell,
  SectionHeader,
} from "./CorporateUI";
import { usePlanillaSelection } from "../contexts/PlanillaSelectionContext";

type PlanillaItem = {
  descripcion: string;
  titulo: string;
  meses: Record<string, number>;
};

export default function PlanillaView() {
  const { documentoSeleccionado, setDocumentoSeleccionado } = usePlanillaSelection();
  const [documento, setDocumento] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [data, setData] = useState<PlanillaItem[] | null>(null);
  const [agente, setAgente] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSearch = useMemo(() => {
    const periodoLimpio = periodo.trim();
    const documentoLimpio = documento.trim();
    // Documento debe ser DNI (exactamente 8 dígitos). Periodo formato YYYY (4 dígitos).
    return /^\d{8}$/.test(documentoLimpio) && /^\d{4}$/.test(periodoLimpio);
  }, [documento, periodo]);

  useEffect(() => {
    if (documentoSeleccionado) {
      setDocumento(documentoSeleccionado);
      setData(null);
      setError("");
      setDocumentoSeleccionado("");
    }
  }, [documentoSeleccionado, setDocumentoSeleccionado]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setData(null);

    if (!canSearch) {
      setError("Ingrese un DNI válido (8 dígitos) y un período en formato AAAA.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/planilla?documento=${encodeURIComponent(documento.trim())}&periodo=${encodeURIComponent(periodo.trim())}`,
        { cache: "no-store" }
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        // No exponer detalles internos del servidor. Mapear según código HTTP.
        if (res.status >= 500) {
          throw new Error("Error del servidor. Intente nuevamente más tarde.");
        }
        if (res.status === 404) {
          throw new Error("No se encontró la planilla para el documento y período indicados.");
        }
        // Para 4xx devolvemos un mensaje orientativo sin raw details.
        throw new Error(payload?.error ? String(payload.error) : "Datos inválidos. Verifique y vuelva a intentar.");
      }

      setData(payload as PlanillaItem[]);

      // Intentar recuperar información del agente desde el endpoint interno
      try {
        const agRes = await fetch(
          `/api/agentes/idyperiodo?documento=${encodeURIComponent(documento.trim())}&periodo=${encodeURIComponent(periodo.trim())}`,
          { cache: "no-store" }
        );

        if (agRes.ok) {
          const agPayload = await agRes.json().catch(() => null);
          // El endpoint devuelve un array; tomar primer elemento si existe
          if (Array.isArray(agPayload)) {
            setAgente(agPayload.length > 0 ? agPayload[0] : null);
          } else {
            setAgente(agPayload ?? null);
          }
        } else {
          setAgente(null);
        }
      } catch (e) {
        setAgente(null);
      }
    } catch (err: any) {
      // Mensaje amigable por defecto.
      setError(err?.message || "Ocurrió un error. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (data) {
    return (
      <div className="fade-enter-active">
        <PlanillaTable
          data={data}
          documento={documento}
          periodo={periodo}
          agente={agente}
          onBack={() => {
            setData(null);
            setAgente(null);
          }}
        />
      </div>
    );
  }

  const emptyMessage =
    !loading && !error ? "Ingrese documento (8 digitos) y periodo (AAAA) para iniciar." : "";

  return (
    <PageShell>
      <SectionHeader
        title="Consulta de planillas"
        subtitle="Ingrese documento y periodo fiscal para visualizar la planilla."
      />

      <FilterBar onSubmit={buscar}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1F2933]">Documento</label>
          <input
            value={documento}
            onChange={(e) => setDocumento(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            className="h-10 border border-[#D0D7E2] rounded-[4px] px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#6B7280] bg-[#FFFFFF] focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,.15)] focus:outline-none transition"
            placeholder="Ej: 20123456"
          />
          <p className="text-xs text-[#6B7280]">8 dígitos</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1F2933]">Período</label>
          <input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className="h-10 border border-[#D0D7E2] rounded-[4px] px-3 py-2 text-sm text-[#1F2933] placeholder:text-[#6B7280] bg-[#FFFFFF] focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,.15)] focus:outline-none transition"
            placeholder="Ej: 2024"
          />
          <p className="text-xs text-[#6B7280]">Año (AAAA)</p>
        </div>

        <ButtonPrimary type="submit" disabled={!canSearch || loading}>
          {loading ? "Preparando información..." : "Buscar"}
        </ButtonPrimary>

        <ButtonSecondary
          type="button"
          onClick={() => {
            setDocumento("");
            setPeriodo("");
            setData(null);
            setError("");
            setAgente(null);
          }}
        >
          Limpiar
        </ButtonSecondary>
      </FilterBar>

      {error && <AlertBox message={error} />}

      <div className={`card ${loading ? "loading" : ""} text-sm text-[#6B7280] min-h-[180px] flex items-center justify-center` }>
        {loading ? (
          <div className="w-full space-y-3">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-1/2" />
            <div className="skeleton h-4 rounded w-2/3" />
            <div className="flex gap-2 mt-4">
              <div className="skeleton h-8 rounded w-24" />
              <div className="skeleton h-8 rounded w-24" />
            </div>
            <div className="text-sm text-[#6B7280] mt-3">Preparando información...</div>
          </div>
        ) : (
          emptyMessage
        )}
      </div>
    </PageShell>
  );
}