// src/app/components/PlanillaTable.tsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PlanillaItem = {
  descripcion: string;
  titulo: string; // "1" => fila título (bold)
  meses: Record<string, number>;
};

type Props = {
  data: PlanillaItem[];
  documento: string;
  periodo: string;
  onBack: () => void;
  agente?: Record<string, any> | null;
};

const MONTH_ORDER = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function norm(k: string) {
  return k.trim();
}

function collectMonths(data: PlanillaItem[]) {
  const set = new Set<string>();
  for (const row of data) {
    for (const k of Object.keys(row.meses ?? {})) set.add(norm(k));
  }

  const months = Array.from(set);
  months.sort((a, b) => {
    const ia = MONTH_ORDER.indexOf(a);
    const ib = MONTH_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return months;
}

function money(n: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ✅ Bloques SOLO por texto
function isBlockRow(desc: string) {
  const d = (desc ?? "").toUpperCase();
  return (
    d.includes("HABERES P/CALCULO DE SAC") ||
    d.includes("HABERES EXENTOS") ||
    d.includes("HABERES GRAVADOS") ||
    d.includes("LIQUIDACION") ||
    d.includes("LIQUIDACIÓN")
  );
}

export function PlanillaTable({
  data,
  documento,
  periodo,
  onBack,
  agente = null,
}: Props) {
  const months = useMemo(() => collectMonths(data), [data]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const [scale, setScale] = useState(1);

  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  const recalc = () => {
    if (!isDesktop()) {
      setScale(1);
      return;
    }

    const viewport = viewportRef.current;
    const table = tableRef.current;
    if (!viewport || !table) return;

    const availableW = viewport.clientWidth;
    const availableH = viewport.clientHeight;

    const neededW = table.scrollWidth;
    const neededH = table.scrollHeight;

    if (!availableW || !availableH || !neededW || !neededH) return;

    const sW = availableW / neededW;
    const sH = availableH / neededH;

    const raw = Math.min(sW, sH, 1);

    // Excel-like: que no aplaste demasiado
    const MIN = 0.82;
    setScale(Math.max(MIN, raw));
  };

  useLayoutEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.length, data]);

  useEffect(() => {
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => recalc());
    if (viewportRef.current) ro.observe(viewportRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const descargarExcel = async () => {
    try {
      const res = await fetch(
        `/api/planilla/excel?documento=${encodeURIComponent(
          documento.trim()
        )}&periodo=${encodeURIComponent(periodo.trim())}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Error al generar Excel");

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `planilla_${documento}_${periodo}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el Excel");
    }
  };

  return (
    <div className="w-[70vw] h-[85vh] flex items-start justify-center">
      {/* contenedor “hoja” (sin sombras, estilo Excel) */}
      <div className="w-full h-full bg-white flex flex-col overflow-hidden border border-gray-300">
        {/* header estilo Excel */}
        <div className="px-4 py-2 border-b border-gray-300">
          <div className="text-sm font-bold text-black">
            Planilla de Liquidación Impuesto a las Ganancias
          </div>
          <div className="text-xs text-black mt-0.5">
            Período: <b>{periodo}</b>
          </div>
          <div className="text-xs text-black mt-0.5 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div>
                <span className="text-[12px]">Agente: </span>
                <b className="text-[12px]">
                  {agente &&
                    ((agente.nya && String(agente.nya).trim()) ||
                      (agente.nombre && String(agente.nombre).trim()) ||
                      documento)}
                </b>
              </div>

              <div className="text-[11px] text-gray-700 mt-1">
                Empresa:{" "}
                {agente && agente.empresa
                  ? String(agente.empresa).trim()
                  : "No declarado en este periodo"}
              </div>

              <div className="text-[11px] text-gray-700">
                CUIL:{" "}
                {agente && agente.cuil
                  ? String(agente.cuil).trim()
                  : "No declarado en este periodo"}
              </div>

              <div className="text-[11px] text-gray-700">
                Ultima Declaracion F572:{" "}
                {agente && agente.fechaWeb
                  ? String(agente.fechaWeb).trim()
                  : "No declarado en este periodo"}
              </div>

              <div className="text-[11px] text-gray-700">
                Exceptuado:{" "}
                {(() => {
                  const ex = agente?.excep;
                  if (ex === null || ex === undefined)
                    return "No declarado en este periodo";
                  if (String(ex).trim() === "1" || Number(ex) === 1)
                    return "Sí";
                  if (String(ex).trim() === "0" || Number(ex) === 0)
                    return "No";
                  return String(ex);
                })()}
              </div>

              {agente &&
                ((agente.cuitAgentRent &&
                  String(agente.cuitAgentRent).trim() !== "0") ||
                  (agente.descripAgentRent &&
                    String(agente.descripAgentRent).trim())) && (
                  <div className="text-[11px] text-gray-700 mt-1">
                    {agente.cuitAgentRent &&
                    String(agente.cuitAgentRent).trim() !== "0"
                      ? `Cuit Agent Rent: ${String(
                          agente.cuitAgentRent
                        ).trim()}`
                      : null}
                    {agente.cuitAgentRent &&
                    String(agente.cuitAgentRent).trim() !== "0" &&
                    agente.descripAgentRent
                      ? " · "
                      : null}
                    {agente.descripAgentRent
                      ? String(agente.descripAgentRent).trim()
                      : null}
                  </div>
                )}
            </div>

            <div className="flex gap-2">
              <button
                    onClick={descargarExcel}
                    className="
                              flex items-center gap-1
                              bg-green-600 hover:bg-green-700
                              text-white text-xs font-semibold
                              px-3 py-1 rounded
                              shadow
                            "
                    title="Descargar Excel"
                  >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 2H8a2 2 0 0 0-2 2v3H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-4 18H5V9h10zm5-5h-3V7a2 2 0 0 0-2-2H8V4h11z" />
                  <path d="M7.5 16l1.5-3 1.5 3H12l-2-4 2-4h-1.5l-1.5 3-1.5-3H6l2 4-2 4z" />
                </svg>
                Excel
              </button>
            </div>

            <button
              onClick={onBack}
              className="border border-gray-400 px-3 py-1 text-xs font-semibold text-black hover:bg-gray-100"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* viewport scrolleable (como Excel) */}
        <div
          ref={viewportRef}
          className="flex-1 min-h-0 overflow-auto px-2 py-2"
        >
          <div
            style={{
              // Escala suave SOLO si realmente hace falta
              transform:
                isDesktop() && scale < 0.98 ? `scale(${scale})` : undefined,
              transformOrigin: "left top",
              width:
                isDesktop() && scale < 0.98 ? `${(1 / scale) * 100}%` : "100%",
            }}
          >
            <table
              ref={tableRef}
              className="min-w-[980px] w-full border-collapse text-[11px]"
            >
              {/* Encabezado negro duro */}
              <thead className="bg-black text-white text-[11px]">
                <tr>
                  <th
                    className="
                      sticky top-0 z-20 bg-black
                      px-2 py-[4px]
                      text-center
                      font-bold uppercase
                      border border-black
                      w-[280px]
                      whitespace-nowrap overflow-hidden text-ellipsis
                    "
                    title="Conceptos"
                  >
                    Conceptos
                  </th>

                  {months.map((m) => (
                    <th
                      key={m}
                      className="
                        sticky top-0 z-20 bg-black
                        px-2 py-[4px]
                        text-center
                        font-bold uppercase
                        border border-black
                        whitespace-nowrap
                      "
                      title={m}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {data.map((row, idx) => {
                  const desc = row.descripcion ?? "";
                  const block = isBlockRow(desc);
                  const isTitleRow = String(row.titulo ?? "") === "1";

                  // Filas de bloque (tipo “::: HABERES :::”)
                  if (block) {
                    return (
                      <tr key={`block-${idx}`} className="bg-gray-200">
                        <td
                          colSpan={months.length + 1}
                          className="
                            px-2 py-[3px]
                            text-[11px]
                            font-bold text-black
                            border border-dotted border-gray-500
                            uppercase
                            whitespace-nowrap overflow-hidden text-ellipsis
                          "
                          title={desc}
                        >
                          {desc}
                        </td>
                      </tr>
                    );
                  }

                  // Filas normales Excel (zebra suave, sin hover moderno)
                  const zebra = idx % 2 === 0 ? "bg-white" : "bg-gray-100";

                  return (
                    <tr
                      key={`row-${idx}`}
                      className={[
                        zebra,
                        "border-b border-dotted border-gray-400",
                      ].join(" ")}
                    >
                      {/* primera columna sticky */}
                      <td
                        className={[
                          "sticky left-0 z-10",
                          zebra,
                          "px-2 py-[3px]",
                          "border-r border-dotted border-gray-400",
                          "whitespace-nowrap overflow-hidden text-ellipsis",
                          isTitleRow
                            ? "font-bold text-black uppercase"
                            : "font-normal text-black",
                        ].join(" ")}
                        title={desc}
                      >
                        <span className="mr-1 text-gray-500">•</span>
                        {desc}
                      </td>

                      {months.map((m) => {
                        let val = 0;
                        for (const [k, v] of Object.entries(row.meses ?? {})) {
                          if (norm(k) === m) {
                            val = v;
                            break;
                          }
                        }

                        const negative = val < 0;

                        return (
                          <td
                            key={`${idx}-${m}`}
                            className={[
                              "px-2 py-[3px]",
                              "text-right tabular-nums whitespace-nowrap",
                              "border-l border-dotted border-gray-400",
                              isTitleRow
                                ? "font-bold text-black"
                                : "font-normal text-black",
                              negative ? "text-red-700" : "",
                            ].join(" ")}
                            title={money(val)}
                          >
                            {money(val)}
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
    </div>
  );
}
