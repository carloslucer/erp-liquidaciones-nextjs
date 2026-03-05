'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

interface ImportResult {
  importados?: number | string[];
  ignorados?: number | string[];
  errores?: number | string[];
  mensaje?: string;
}

/** Devuelve la cantidad, ya sea que el campo venga como number o como array */
function getCount(field?: number | string[]): number {
  if (field == null) return 0;
  if (typeof field === 'number') return field;
  return field.length;
}

/** Devuelve los items como array; si es un número, devuelve array vacío */
function getItems(field?: number | string[]): string[] {
  if (Array.isArray(field)) return field;
  return [];
}

export default function UploadPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = '.pdf';
  const NAME_PATTERN = /^\d+_\d{4}_presentacion_\d+\.pdf$/i;

  const validateFiles = (incoming: File[]): File[] => {
    const valid: File[] = [];
    const rejected: string[] = [];

    for (const f of incoming) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        rejected.push(`${f.name} — no es PDF`);
      } else if (!NAME_PATTERN.test(f.name)) {
        rejected.push(`${f.name} — nombre inválido (esperado: cuit_periodo_presentacion_nro.pdf)`);
      } else {
        valid.push(f);
      }
    }

    if (rejected.length > 0) {
      toast.warning(
        `${rejected.length} archivo(s) rechazados:\n${rejected.slice(0, 5).join('\n')}${rejected.length > 5 ? `\n...y ${rejected.length - 5} más` : ''}`,
        { duration: 6000 }
      );
    }

    return valid;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const valid = validateFiles(incoming);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existing.has(f.name))];
    });
    setResult(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const incoming = Array.from(e.dataTransfer.files);
    const valid = validateFiles(incoming);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existing.has(f.name))];
    });
    setResult(null);
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const clearAll = () => {
    setFiles([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.warning('Seleccioná al menos un archivo PDF.');
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append('archivos', file);
    }

    try {
      const res = await fetch('/api/declaraciones/importar', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 401) {
        toast.error('Sesión expirada. Iniciá sesión nuevamente.');
        setUploading(false);
        return;
      }

      const data: ImportResult = await res.json();

      if (!res.ok) {
        toast.error(data.mensaje || 'Error al importar archivos.');
        setResult(data);
        setUploading(false);
        return;
      }

      setResult(data);

      const importados = getCount(data.importados);
      const ignorados = getCount(data.ignorados);
      const errores = getCount(data.errores);

      if (importados > 0 && errores === 0) {
        toast.success(`${importados} archivo(s) importado(s) correctamente.`);
      } else if (errores > 0) {
        toast.error(`${errores} archivo(s) con error. Revisá el detalle.`);
      } else if (ignorados > 0 && importados === 0) {
        toast.info('Todos los archivos ya existían. Ninguno importado.');
      }

      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4" style={{ background: '#F5F7FA', paddingBottom: '12vh' }}>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#f5f7fa',
            color: '#1F2933',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          duration: 3000,
        }}
      />

      <div
        className="w-full max-w-2xl"
        style={{
          background: '#fff',
          border: '1px solid #D0D7E2',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
        }}
      >
        {/* Título */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1F2933',
            marginBottom: '4px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Declaración Jurada F.572 — Importar PDF
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>
          Subí uno o más archivos PDF de declaraciones juradas. Formato del nombre:{' '}
          <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
            cuit_periodo_presentacion_nro.pdf
          </code>
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#2563EB' : '#D0D7E2'}`,
            borderRadius: '8px',
            padding: '32px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(37,99,235,0.04)' : '#FAFBFC',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
          <p style={{ fontSize: '14px', color: '#1F2933', fontWeight: 500 }}>
            Arrastrá los archivos PDF aquí
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            o hacé click para seleccionar
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  borderLeft: '4px solid #2563EB',
                  paddingLeft: '8px',
                  color: '#1F2933',
                }}
              >
                Archivos seleccionados ({files.length})
              </span>
              <button
                onClick={clearAll}
                style={{
                  fontSize: '12px',
                  color: '#DC2626',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Limpiar todo
              </button>
            </div>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #D0D7E2',
                borderRadius: '6px',
              }}
            >
              {files.map((f) => (
                <div
                  key={f.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid #E5EAF3',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#1F2933',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {f.name}
                  </span>
                  <button
                    onClick={() => removeFile(f.name)}
                    style={{
                      color: '#DC2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                    title="Quitar archivo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          style={{
            width: '100%',
            height: '44px',
            background: uploading || files.length === 0 ? '#9CA3AF' : '#2563EB',
            color: '#fff',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: uploading || files.length === 0 ? 'none' : '0 2px 6px rgba(37,99,235,.35)',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!uploading && files.length > 0)
              (e.target as HTMLButtonElement).style.background = '#1D4ED8';
          }}
          onMouseLeave={(e) => {
            if (!uploading && files.length > 0)
              (e.target as HTMLButtonElement).style.background = '#2563EB';
          }}
        >
          {uploading ? (
            <>
              <span className="erp-loader" style={{ display: 'inline-flex', gap: '4px' }}>
                <span className="erp-dot" />
                <span className="erp-dot" />
                <span className="erp-dot" />
              </span>
              Importando…
            </>
          ) : (
            'Importar Declaraciones'
          )}
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '24px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                borderLeft: '4px solid #2563EB',
                paddingLeft: '8px',
                color: '#1F2933',
                display: 'block',
                marginBottom: '12px',
              }}
            >
              Resultado de la importación
            </span>

            {/* Importados */}
            {getCount(result.importados) > 0 && (
              <ResultBlock
                title="Importados correctamente"
                items={getItems(result.importados)}
                count={getCount(result.importados)}
                color="#16A34A"
                bgColor="rgba(22,163,74,0.06)"
              />
            )}

            {/* Ignorados */}
            {getCount(result.ignorados) > 0 && (
              <ResultBlock
                title="Ya existían (ignorados)"
                items={getItems(result.ignorados)}
                count={getCount(result.ignorados)}
                color="#F59E0B"
                bgColor="rgba(245,158,11,0.06)"
              />
            )}

            {/* Errores */}
            {getCount(result.errores) > 0 && (
              <ResultBlock
                title="Errores"
                items={getItems(result.errores)}
                count={getCount(result.errores)}
                color="#DC2626"
                bgColor="rgba(220,38,38,0.06)"
              />
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && files.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0 8px',
              color: '#6B7280',
              fontSize: '13px',
            }}
          >
            Aún no hay archivos seleccionados. Arrastrá o seleccioná PDFs para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-component: Result block ---------- */
function ResultBlock({
  title,
  items,
  count,
  color,
  bgColor,
}: {
  title: string;
  items: string[];
  count: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${color}20`,
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '12px',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: 600, color, marginBottom: '6px' }}>
        {title} ({count})
      </p>
      {items.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '12px',
                color: '#1F2933',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '2px 0',
              }}
            >
              • {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
          {count} archivo(s) procesado(s).
        </p>
      )}
    </div>
  );
}
