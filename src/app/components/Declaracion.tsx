'use client';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

export default function DeclaracionXml() {
  const [estado, setEstado] = useState<string>('');
  const [estadoClass, setEstadoClass] = useState<string>('text-green-600');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const interval = setInterval(checkEstado, 10000);
    checkEstado();
    return () => clearInterval(interval);
  }, []);

  const checkEstado = async () => {
    try {
      const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${backendBase}/api/import/estado`, {
        method: 'GET',
        credentials: 'include'
      });
      const texto = await res.text();
      setEstado(texto);

      if (texto === "En proceso") {
        setDisabled(true);
        setEstadoClass("text-yellow-600 font-semibold");
      } else {
        setDisabled(false);
        setEstadoClass("text-green-600 font-semibold");
      }
    } catch (e) {
      setEstado("Error al consultar el estado.");
      setEstadoClass("text-red-600 font-semibold");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.warning("Seleccioná una carpeta con archivos.");
      return;
    }

    setDisabled(true);
    setEstado("Subiendo archivos...");
    setEstadoClass("text-yellow-600");

    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file);
    }

    try {
      const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${backendBase}/api/import/xml`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });
 

      const texto = await res.text();
      setTimeout(() => {
        setEstado(texto);
        setEstadoClass(res.ok ? "text-green-600 font-bold" : "text-red-600 font-bold");
      }, 2000);
    } catch (e) {
      setEstado("Error en la subida.");
      setEstadoClass("text-red-600 font-bold");
    }

    setTimeout(checkEstado, 7000);
  };

  return (
    <div className="flex justify-center items-center h-[90%] w-[100%]  bg-white shadow-2xl p-10">
      <Toaster position="top-center" />
      <div className="flex flex-col justify-center items-center h-[100%] w-[80%] p-10 rounded-b-lg  ">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          PRESENTACIÓN F. 572 - SIRADIG
        </h2>
        <p className="text-center text-gray-600 mb-13">
          Módulo de importación de archivos XML de Presentaciones ARCA
        </p>

        <form onSubmit={handleSubmit} className=" space-y-6 ">
          <div>
            <label htmlFor="file" className="block font-medium text-gray-700 mb-2">
              Seleccionar carpeta:
            </label>
            <input
              type="file"
              id="file"
              name="file"
              {...{ webkitdirectory: "true" }}
              multiple
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFiles(Array.from(e.target.files ?? []))
              }
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={disabled}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ${
                disabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              🚀 Subir Archivos
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-700">Estado actual: </span>
            <span className={estadoClass}>{estado}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
