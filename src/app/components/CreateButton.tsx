import type { CreateButtonProps } from "./types";

export default function CreateButton({ onClick, nombre, color }: CreateButtonProps) {
  return (
    <button
      type="button"
      className="flex-1 sm:flex-none px-4 py-1 text-white bg-[#052c65] hover:bg-[#052c65]focus:ring-4 focus:ring-blue-900 font-medium rounded-1 me-2 mb-3 transition"
      onClick={onClick}
    >
      {nombre}
    </button>
  );
}
