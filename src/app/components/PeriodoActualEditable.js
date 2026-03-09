'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Pencil } from 'lucide-react';
import { toast, Toaster } from 'sonner'
export default function PeriodoActualEditable() {
  const [periodo, setPeriodo] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Obtener periodo actual
  const fetchPeriodo = async () => {
    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${backendBase}/api/periodo_liquidado`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const fecha = data.periodo ? data.periodo.substring(0, 7) : "";
        setPeriodo(fecha); // o según la estructura
      })
      .catch((error) => {
        // Error al obtener el periodo
      });
  };


  useEffect(() => {
    fetchPeriodo();
    // Escuchar cambios globales
    const handler = () => fetchPeriodo();
    window.addEventListener('periodoActualizado', handler);
    return () => window.removeEventListener('periodoActualizado', handler);
  }, []);

  const actualizarPeriodo = async () => {
    const fechaActual = new Date().toISOString()
    if (!periodo) return;
    setCargando(true);
    try {
      const periodoFormateado = `${periodo}-01`

      const body = {
        periodo: periodoFormateado,
        ultimaActualizacion: fechaActual,
      };

      const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${backendBase}/api/periodo_liquidado`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const msg = await res.text();
      setEditando(false);
      window.dispatchEvent(new Event('periodoActualizado'));
      toast.success(msg)
    } catch (error) {
      alert('Error al actualizar el periodo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white shadow-xl px-4 py-3 rounded-lg text-gray-700 text-sm z-50 w-fit">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays className="w-4 h-4 text-blue-700" />
        <span>Período actual:</span>
        {!editando ? (
          <strong className="text-blue-800">{periodo}</strong>
        ) : (
          <input
            type="month"
            className="border px-2 py- rounded text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        )}
        <button onClick={() => setEditando(!editando)}>
          <Pencil className="w-4 h-4 text-blue-700 hover:text-blue-900" />
        </button>
      </div>

      {ultimaActualizacion && !editando && (
        <p className="text-xs text-gray-500 ml-6">
          Última actualización: {ultimaActualizacion}
        </p>
      )}

      {editando && (
        <div className="flex justify-end mt-3 gap-2">
          <button
            onClick={() => setEditando(false)}
            className="text-xs bg-red-500 px-2 py-1.5 rounded hover:bg-gray-400 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={actualizarPeriodo}
            disabled={cargando}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
}
