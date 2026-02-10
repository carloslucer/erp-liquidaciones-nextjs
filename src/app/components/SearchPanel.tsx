"use client";

import React from "react";
import { FilterBar, ButtonPrimary } from "./CorporateUI";
import { Agente } from "./types";

type Props = {
  value: string;
  loading: boolean;
  isNombre: boolean;
  showSuggestions: boolean;
  sugerencias: Agente[];
  sugLoading: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: (value: string) => void;
  onFocusInput: () => void;
  onBlurInput: () => void;
  onPickSuggestion: (agente: Agente) => void;
};

export function SearchPanel({
  value,
  loading,
  isNombre,
  showSuggestions,
  sugerencias,
  sugLoading,
  onSubmit,
  onChange,
  onFocusInput,
  onBlurInput,
  onPickSuggestion,
}: Props) {
  return (
    <FilterBar onSubmit={onSubmit}>
      <div className="flex flex-col gap-1 relative">
        <div className="flex items-center justify-between ">
          <label
            htmlFor="agente-query"
            className="text-[13px] font-medium text-[#1F2933] "
          >
            Documento o nombre
          </label>
          <span className="text-xs text-[#6B7280]">
            Use 8 dígitos o mínimo 3 letras
          </span>
        </div>
        <input
          id="agente-query"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          placeholder="Ej: 20257490 o Juan Perez"
          className="w-[360px] max-w-full h-9 border border-[#D0D7E2] rounded-[4px] px-2.5 text-sm text-[#1F2933] placeholder:text-[#6B7280] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_2px_rgba(37,99,235,.15)] focus:outline-none"
        />

        {isNombre && showSuggestions && (
          <div className="absolute left-0 right-0 top-full mt-1 border border-[#D0D7E2] bg-white z-20 rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
            <div className="px-4 py-2 border-b border-[#D0D7E2] flex items-center justify-between bg-[#E5EAF3]">
              <span className="text-sm font-semibold text-[#1F2933] uppercase">
                Sugerencias
              </span>
              <span className="text-xs text-[#6B7280]">
                {sugLoading ? "Buscando..." : sugerencias.length}
              </span>
            </div>
            {sugerencias.length > 0 ? (
              <ul className="max-h-64 overflow-auto">
                {sugerencias.map((a) => (
                  <li key={a.documento}>
                    <button
                      type="button"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => onPickSuggestion(a)}
                      className="w-full text-left px-4 py-3 border-b border-[#D0D7E2] last:border-b-0 bg-white hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1F2933] truncate">
                            {a.nya?.trim() || "(Sin nombre)"}
                          </p>
                          <p className="text-xs text-[#6B7280] truncate">
                            Doc: {a.documento} – {a.empresa?.trim() || "-"}
                          </p>
                        </div>
                        <span className="text-xs text-[#6B7280] whitespace-nowrap">
                          {a.periodo}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-xs text-[#6B7280] bg-white text-center">
                {sugLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="skeleton h-3 rounded w-48 mb-2" />
                    <div className="text-xs">Preparando información...</div>
                  </div>
                ) : (
                  "Sin coincidencias."
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ButtonPrimary
        type="submit"
        disabled={loading}
        className="self-end h-9 rounded-[4px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-none"
      >
        {loading ? "Preparando información..." : "Buscar"}
      </ButtonPrimary>
    </FilterBar>
  );
}
