'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

interface StartResponse {
  idProceso?: number;
  totalArchivos?: number;
  error?: string;
  mensaje?: string;
}

interface LoteResult {
  idProceso: number;
  cantidad: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ERROR';
  fechaInicio: string | null;
  fechaFin: string | null;
  mensajeError: string | null;
}

export default function UploadPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');
  const [loteResults, setLoteResults] = useState<LoteResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Espera hasta que un proceso termine y devuelve su resultado */
  const waitForProcess = (id: number): Promise<LoteResult> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/declaraciones/proceso/${id}`);
          if (res.status === 401) {
            clearInterval(interval);
            reject(new Error('SESSION_EXPIRED'));
            return;
          }
          const data: LoteResult = await res.json();
          if (data.estado === 'COMPLETADO' || data.estado === 'ERROR') {
            clearInterval(interval);
            resolve(data);
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2500);
    });
  };

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
        rejected.length === 1
          ? 'Un archivo fue rechazado por nombre o formato inválido.'
          : `${rejected.length} archivos rechazados por nombre o formato inválido.`,
        { duration: 4000 }
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
    setLoteResults([]);
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
    setLoteResults([]);
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const clearAll = () => {
    setFiles([]);
    setLoteResults([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.warning('Seleccioná al menos un archivo PDF.');
      return;
    }

    setUploading(true);
    setLoteResults([]);

    const formData = new FormData();
    for (const file of files) formData.append('archivos', file);

    try {
      const res = await fetch('/api/declaraciones/importar', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 401) {
        toast.error('Sesión expirada. Iniciá sesión nuevamente.');
        return;
      }

      const data: StartResponse = await res.json();

      if (!res.ok || !data.idProceso) {
        throw new Error(data.error || data.mensaje || 'Error al iniciar la importación.');
      }

      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
      setUploading(false);
      setProcesando(true);
      setBatchProgress(`Procesando ${data.totalArchivos ?? '?'} archivos…`);

      // Esperar el único proceso
      const resultado = await waitForProcess(data.idProceso);

      setLoteResults([resultado]);
      setProcesando(false);
      setBatchProgress('');

      if (resultado.estado === 'COMPLETADO') {
        toast.success(`${resultado.cantidad} archivo(s) procesado(s) correctamente.`);
      } else {
        toast.error(resultado.mensajeError || 'El proceso finalizó con errores.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'SESSION_EXPIRED') {
        toast.error('Sesión expirada. Iniciá sesión nuevamente.');
      } else {
        toast.error(msg || 'Error de conexión con el servidor.');
      }
      setProcesando(false);
      setBatchProgress('');
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
          disabled={uploading || procesando || files.length === 0}
          style={{
            width: '100%',
            height: '44px',
            background: uploading || procesando || files.length === 0 ? '#9CA3AF' : '#2563EB',
            color: '#fff',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: uploading || procesando || files.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: uploading || procesando || files.length === 0 ? 'none' : '0 2px 6px rgba(37,99,235,.35)',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!uploading && !procesando && files.length > 0)
              (e.target as HTMLButtonElement).style.background = '#1D4ED8';
          }}
          onMouseLeave={(e) => {
            if (!uploading && !procesando && files.length > 0)
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
              {batchProgress || 'Enviando archivos…'}
            </>
          ) : (
            'Importar Declaraciones'
          )}
        </button>

        {/* Estado procesando (polling) */}
        {procesando && (
          <div
            style={{
              marginTop: '24px',
              background: 'rgba(37,99,235,0.05)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <span className="erp-loader" style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center', marginBottom: '10px' }}>
              <span className="erp-dot" />
              <span className="erp-dot" />
              <span className="erp-dot" />
            </span>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#2563EB', margin: '0 0 4px' }}>
              {batchProgress || 'Procesando archivos…'}
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Esto puede tardar unos segundos. No cerrés esta ventana.
            </p>
          </div>
        )}

        {/* Results */}
        {loteResults.length > 0 && !procesando && (
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
            <div style={{ border: '1px solid #D0D7E2', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#E5EAF3' }}>
                      <th style={thStyle}>Lote</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Archivos</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                      <th style={thStyle}>Inicio</th>
                      <th style={thStyle}>Fin</th>
                      <th style={{ ...thStyle, borderRight: 'none' }}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loteResults.map((l, i) => (
                      <tr
                        key={l.idProceso}
                        style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC', borderTop: '1px solid #D0D7E2' }}
                      >
                        <td style={tdStyle}>#{l.idProceso}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{l.cantidad}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <EstadoBadge estado={l.estado} />
                        </td>
                        <td style={tdStyle}>{formatFecha(l.fechaInicio)}</td>
                        <td style={tdStyle}>{formatFecha(l.fechaFin)}</td>
                        <td style={{ ...tdStyle, color: '#DC2626', borderRight: 'none' }}>
                          {l.mensajeError ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {loteResults.length === 0 && !procesando && files.length === 0 && (
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

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontWeight: 600,
  color: '#1F2933',
  textAlign: 'left',
  fontSize: '12px',
  borderRight: '1px solid #D0D7E2',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  color: '#1F2933',
  borderRight: '1px solid #D0D7E2',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '12px',
  whiteSpace: 'nowrap',
};

function formatFecha(fecha: string | null): string {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return fecha;
  }
}

function EstadoBadge({ estado }: { estado: LoteResult['estado'] }) {
  const map: Record<LoteResult['estado'], { label: string; color: string; bg: string }> = {
    PENDIENTE:  { label: 'Pendiente',  color: '#6B7280', bg: '#F3F4F6' },
    EN_PROCESO: { label: 'En proceso', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    COMPLETADO: { label: 'Completado', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    ERROR:      { label: 'Error',      color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  };
  const s = map[estado] ?? map.PENDIENTE;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 600,
        fontSize: '11px',
        color: s.color,
        background: s.bg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {s.label}
    </span>
  );
}
