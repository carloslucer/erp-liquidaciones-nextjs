'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import RoleGuard from '@/app/components/RoleGuard';

export default function HistorialImportacion() {
  const [historial, setHistorial] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [historialFiltrado, setHistorialFiltrado] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/import/historial`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setHistorial(data))
      .catch(() => alert('Error al cargar el historial'));
  }, []);

  useEffect(() => {
    if (!fechaFiltro) {
      setHistorialFiltrado(historial);
    } else {
      const filtrado = historial.filter((item) =>
        item.fecha.startsWith(fechaFiltro)
      );
      setHistorialFiltrado(filtrado);
    }
  }, [fechaFiltro, historial]);

  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR"]}>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#f5f7fa',
            color: '#222',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          duration: 2000,
        }}
      />

      <div className="w-full h-[90vh] flex items-start justify-center px-6 py-10 bg-gray-200">
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-semibold  text-blue-600 text-center mb-6">
            Historial de Importaciones
          </h2>

          {/* Filtro */}
          <div className="mb-6 flex flex-wrap items-center gap-3 sticky top-0 bg-white z-20 py-2 border-b border-gray-200">
            <label htmlFor="fecha" className="text-gray-600 font-semibold">
              Filtrar por fecha:
            </label>
            <input
              id="fecha"
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="text-gray-700 text-sm rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {fechaFiltro && (
              <button
                onClick={() => setFechaFiltro('')}
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Tabla con scroll */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-900">
              <thead className="bg-gray-100 border-gray-200 border-1 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 font-medium text-left">Fecha</th>
                  <th className="px-5 py-3 font-medium text-left">Archivo</th>
                  <th className="px-5 py-3 font-medium text-left">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-6 text-center text-gray-400 italic select-none"
                    >
                      No hay registros para esa fecha.
                    </td>
                  </tr>
                ) : (
                  historialFiltrado.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors cursor-default"
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        {new Date(item.fecha).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 truncate max-w-xs">{item.nombreArchivo}</td>
                      <td
                        className={`px-5 py-3 font-medium ${
                          item.resultado.startsWith('Error')
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {item.resultado}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
