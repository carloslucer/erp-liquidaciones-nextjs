"use client";

import React, { createContext, useContext, useState } from "react";

type PlanillaSelectionContextType = {
  documentoSeleccionado: string;
  setDocumentoSeleccionado: (documento: string) => void;
};

const PlanillaSelectionContext = createContext<PlanillaSelectionContextType | undefined>(
  undefined
);

export function PlanillaSelectionProvider({ children }: { children: React.ReactNode }) {
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState("");

  return (
    <PlanillaSelectionContext.Provider value={{ documentoSeleccionado, setDocumentoSeleccionado }}>
      {children}
    </PlanillaSelectionContext.Provider>
  );
}

export function usePlanillaSelection() {
  const ctx = useContext(PlanillaSelectionContext);
  if (!ctx) throw new Error("usePlanillaSelection debe usarse dentro de PlanillaSelectionProvider");
  return ctx;
}
