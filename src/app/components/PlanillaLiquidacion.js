import React from "react";

/**
 * Planilla tipo Excel (Ganancias)
 * Recibe:
 *  - rows: [{ descripcion, titulo, meses: { enero: 1000, febrero: 0, ... } }, ...]
 *
 * Reglas:
 *  - titulo === "1" => fila de sección (header gris)
 *  - resto => fila normal con valores por mes
 *
 * Uso:
 * <PlanillaExcelLike
 *   periodo="2025"
 *   agente="20000000- nombre"
 *   rows={tuJson}
 * />
 */
export default function PlanillaLiquidacion({
  titulo = "Planilla de Liquidación Impuesto a las Ganancias",
  periodo = "2025",
  agente = "",
  rows = [],
  // si querés forzar el orden y nombre de columnas:
  monthOrder = DEFAULT_MONTH_ORDER,
  monthLabels = DEFAULT_MONTH_LABELS,
}) {
  const normalized = normalizeRows(rows, monthOrder);

  return (
      <div className="flex justify-center items-center h-[90%] w-[90%]  bg-white shadow-2xl p-10">
    <div style={styles.page}>
      {/* Encabezado */}
      <div style={styles.headerBlock}>
        <div style={styles.title}>{titulo}</div>
        <div style={styles.sub}>Período: {periodo}</div>
        {!!agente && <div style={styles.sub}>Agente: {agente}</div>}
      </div>

      {/* Tabla */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thConcepto }}>CONCEPTOS</th>
              {monthOrder.map((k) => (
                <th key={k} style={styles.th}>
                  {monthLabels[k] ?? k.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {normalized.map((row, idx) => {
              if (row.type === "spacer") {
                return (
                  <tr key={`sp-${idx}`}>
                    <td colSpan={monthOrder.length + 1} style={styles.spacer} />
                  </tr>
                );
              }

              const isSection = row.type === "section";
              const isTotal = row.type === "total"; // por si más adelante querés marcar totales

              return (
                <tr key={`${row.descripcion}-${idx}`}>
                  <td
                    style={{
                      ...styles.tdConcepto,
                      ...(isSection ? styles.sectionCell : null),
                      ...(isTotal ? styles.totalConceptCell : null),
                    }}
                  >
                    {isSection ? `• ${row.descripcion}` : row.descripcion}
                  </td>

                  {monthOrder.map((m) => {
                    const val = row.meses[m];

                    return (
                      <td
                        key={`${idx}-${m}`}
                        style={{
                          ...styles.td,
                          ...(isSection ? styles.sectionCell : null),
                          ...(isTotal ? styles.totalCell : null),
                          ...(typeof val === "number" && val < 0 ? styles.negative : null),
                        }}
                      >
                        {isSection ? "" : formatMoney(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

/* =========================
   Normalización de datos
========================= */

function normalizeRows(rows, monthOrder) {
  // rows puede venir null/undefined
  const safe = Array.isArray(rows) ? rows : [];

  return safe.map((r) => {
    const titulo = String(r?.titulo ?? "");
    const descripcion = String(r?.descripcion ?? "").trim();

    // meses: objeto con claves "enero", "febrero", etc.
    const mesesIn = (r && typeof r.meses === "object" && r.meses) ? r.meses : {};

    // normalizo: aseguro que existan todas las claves del orden de meses
    const meses = {};
    for (const key of monthOrder) {
      const raw = mesesIn[key];
      meses[key] = toNumberOrNull(raw);
    }

    // reglas visuales
    if (titulo === "1") {
      return { type: "section", titulo, descripcion, meses };
    }

    // si en algún momento querés marcar totales:
    // if (descripcion.toUpperCase().includes("TOTAL") || descripcion.toUpperCase().includes("NETO")) ...
    return { type: "row", titulo, descripcion, meses };
  });
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;

  // si viene como string "1.234,56" o "1234.56"
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;

    // intento formato AR: 1.234,56
    const ar = s.replace(/\./g, "").replace(",", ".");
    const n = Number(ar);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

function formatMoney(value) {
  if (value === null || value === undefined) return "";

  const num = Number(value);
  if (!Number.isFinite(num)) return "";

  const abs = Math.abs(num);
  const parts = abs.toFixed(2).split(".");
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dec = parts[1];
  const formatted = `${int},${dec}`;
  return num < 0 ? `-${formatted}` : formatted;
}

/* =========================
   Meses
========================= */

const DEFAULT_MONTH_ORDER = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DEFAULT_MONTH_LABELS = {
  enero: "ENERO",
  febrero: "FEBRERO",
  marzo: "MARZO",
  abril: "ABRIL",
  mayo: "MAYO",
  junio: "JUNIO",
  julio: "JULIO",
  agosto: "AGOSTO",
  septiembre: "SEPTIEMBRE",
  octubre: "OCTUBRE",
  noviembre: "NOVIEMBRE",
  diciembre: "DICIEMBRE",
};

/* =========================
   Estilos (look Excel)
========================= */

const styles = {
  page: {
    fontFamily: "Calibri, Arial, sans-serif",
    fontSize: 12,
    color: "#111",
    padding: 12,
  },
  headerBlock: {
    marginBottom: 10,
  },
  title: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 3,
  },
  sub: {
    fontSize: 12,
    marginBottom: 2,
  },

  tableWrap: {
    border: "1px solid #000",
    overflowX: "auto",
    background: "#fff",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    minWidth: 900,
  },

  th: {
    background: "#000",
    color: "#fff",
    padding: "6px 8px",
    border: "1px solid #000",
    textAlign: "right",
    whiteSpace: "nowrap",
    fontWeight: 700,
  },
  thConcepto: {
    textAlign: "left",
    minWidth: 360,
  },

  tdConcepto: {
    border: "1px dotted #333",
    padding: "5px 8px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    border: "1px dotted #333",
    padding: "5px 8px",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  sectionCell: {
    background: "#EDEDED",
    fontWeight: 700,
    borderTop: "2px solid #000",
    borderBottom: "1px solid #999",
  },

  totalConceptCell: {
    fontWeight: 700,
    borderTop: "2px solid #000",
  },
  totalCell: {
    fontWeight: 700,
    borderTop: "2px solid #000",
  },

  negative: {
    color: "#C00000",
  },

  spacer: {
    height: 6,
    background: "#fff",
    border: "none",
  },
};
