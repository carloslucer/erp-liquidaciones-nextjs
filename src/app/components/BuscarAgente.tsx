"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Agente } from "./types";
import { PageShell, SectionHeader, AlertBox } from "./CorporateUI";
import { SearchPanel } from "./SearchPanel";
import { ResultadosTable } from "./ResultadosTable";
import { PlanillaTable } from "./PlanillaTable";

type PlanillaItem = {
  descripcion: string;
  titulo: string;
  meses: Record<string, number>;
};

type Props = {
  onSelect?: (agente: Agente) => void;
};

function isAgenteArray(data: unknown): data is Agente[] {
  return Array.isArray(data);
}

function isAgenteObject(data: unknown): data is Agente {
  return (
    Boolean(data) &&
    typeof data === "object" &&
    typeof (data as Agente).documento === "string"
  );
}

function isDocumentoValido(q: string) {
  return /^\d{8}$/.test(q.trim());
}

function isSoloNumeros(q: string) {
  return /^\d+$/.test(q.trim());
}

export default function BuscarAgente({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState<Agente[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState<Agente[]>([]);
  const [showSug, setShowSug] = useState(false);

  // Estado para mostrar PlanillaTable
  const [planillaData, setPlanillaData] = useState<PlanillaItem[] | null>(null);
  const [planillaDocumento, setPlanillaDocumento] = useState("");
  const [planillaPeriodo, setPlanillaPeriodo] = useState("");
  const [planillaAgente, setPlanillaAgente] = useState<Record<string, any> | null>(null);
  const [loadingPlanilla, setLoadingPlanilla] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sugAbortRef = useRef<AbortController | null>(null);

  const query = q.trim();
  const canSearch = useMemo(() => query.length >= 3, [query]);
  const esDocumento = useMemo(() => isDocumentoValido(query), [query]);
  const isNombre = useMemo(
    () => canSearch && !esDocumento,
    [canSearch, esDocumento]
  );

  async function fetchAgentes(qValue: string, signal?: AbortSignal) {
    const res = await fetch(
      `/api/agentes/search?q=${encodeURIComponent(qValue)}`,
      {
        credentials: "include",
        cache: "no-store",
        signal,
      }
    );

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status !== 401) {
        const msg = payload?.error || "Error consultando agente";
        const detail = payload?.detail ? ` - ${payload.detail}` : "";
        throw new Error(msg + detail);
      }
      const error = new Error(`HTTP ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

    if (isAgenteArray(payload)) return payload;
    if (isAgenteObject(payload)) return [payload];
    return [];
  }

  useEffect(() => {
    if (!query) setError("");

    if (!isNombre) {
      setSugerencias([]);
      setSugLoading(false);
      return;
    }

    setSugLoading(true);
    setShowSug(true);

    sugAbortRef.current?.abort();
    const controller = new AbortController();
    sugAbortRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const list = await fetchAgentes(query, controller.signal);
        setSugerencias(list.slice(0, 8));
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.status !== 401) {
          setSugerencias([]);
        }
      } finally {
        setSugLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, isNombre]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultados([]);
    setShowSug(false);

    if (isSoloNumeros(query) && !isDocumentoValido(query)) {
      setError(
        "Documento invalido: debe tener exactamente 8 digitos numericos."
      );
      return;
    }

    if (!isDocumentoValido(query) && query.length < 3) {
      setError("Busqueda por nombre: minimo 3 caracteres.");
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const list = await fetchAgentes(query, controller.signal);

      if (isDocumentoValido(query)) {
        if (!list.length) {
          setError(`No existe agente con documento ${query}.`);
          return;
        }
        setResultados([list[0]]);
        return;
      }

      if (!list.length) {
        setError("No se encontraron resultados.");
        return;
      }

      setResultados(list);
    } catch (err: any) {
      if (err?.name !== "AbortError" && err?.status !== 401) {
        setError(err?.message || "Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  function seleccionar(agente: Agente) {
    onSelect?.(agente);
    setShowSug(false);
  }

  async function verLiquidacionActual(agente: Agente) {
    const currentYear = new Date().getFullYear().toString();
    const doc = agente.documento;

    setLoadingPlanilla(true);
    setError("");

    try {
      const res = await fetch(
        `/api/planilla?documento=${encodeURIComponent(doc)}&periodo=${encodeURIComponent(currentYear)}`,
        { cache: "no-store" }
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`No se encontró liquidación para el año ${currentYear}.`);
        }
        throw new Error(payload?.error || "Error al cargar la liquidación.");
      }

      setPlanillaData(payload as PlanillaItem[]);
      setPlanillaDocumento(doc);
      setPlanillaPeriodo(currentYear);

      // Intentar cargar info del agente
      try {
        const agRes = await fetch(
          `/api/agentes/idyperiodo?documento=${encodeURIComponent(doc)}&periodo=${encodeURIComponent(currentYear)}`,
          { cache: "no-store" }
        );

        if (agRes.ok) {
          const agPayload = await agRes.json().catch(() => null);
          if (Array.isArray(agPayload)) {
            setPlanillaAgente(agPayload.length > 0 ? agPayload[0] : null);
          } else {
            setPlanillaAgente(agPayload ?? null);
          }
        } else {
          setPlanillaAgente(null);
        }
      } catch (e) {
        setPlanillaAgente(null);
      }
    } catch (err: any) {
      setError(err?.message || "Error al cargar la liquidación.");
    } finally {
      setLoadingPlanilla(false);
    }
  }

  function elegirSugerencia(agente: Agente) {
    setQ(agente.nya?.trim() || agente.documento);
    setShowSug(false);
  }

  const emptyState =
    !loading && !error && resultados.length === 0
      ? query
        ? "Sin resultados para la busqueda actual."
        : "Ingrese un documento (8 digitos) o un nombre (minimo 3 letras) para iniciar."
      : "";

  const handleInputChange = (value: string) => {
    setQ(value);
    setShowSug(true);
    setError("");
  };

  const handleInputFocus = () => {
    if (isNombre) setShowSug(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSug(false), 120);
  };

  // Si hay datos de planilla, mostrar PlanillaTable
  if (planillaData) {
    return (
      <div className="fade-enter-active">
        <PlanillaTable
          data={planillaData}
          documento={planillaDocumento}
          periodo={planillaPeriodo}
          agente={planillaAgente}
          onBack={() => {
            setPlanillaData(null);
            setPlanillaAgente(null);
          }}
        />
      </div>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        title="Busqueda de agentes"
        subtitle="Consulte por documento (8 digitos) o por nombre (minimo 3 letras)."
      />

      <SearchPanel
        value={q}
        loading={loading}
        isNombre={isNombre}
        showSuggestions={showSug}
        sugerencias={sugerencias}
        sugLoading={sugLoading}
        onSubmit={buscar}
        onChange={handleInputChange}
        onFocusInput={handleInputFocus}
        onBlurInput={handleInputBlur}
        onPickSuggestion={elegirSugerencia}
      />

      {error && <AlertBox message={error} />}

      <ResultadosTable
        resultados={resultados}
        emptyState={emptyState}
        onSelect={seleccionar}
        onVerLiquidacion={verLiquidacionActual}
        loading={loading || loadingPlanilla}
      />
    </PageShell>
  );
}
