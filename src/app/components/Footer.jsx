export default function Footer({ dark = true, transparent = false }) {
  return (
    <footer 
      className={`py-6 mt-auto w-full transition-all duration-300 ${
        transparent 
          ? 'bg-gradient-to-t from-black/60 to-transparent text-white/80' 
          : (dark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-600')
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-2">
        
           <p className="text-center text-[13px] text-xs font-medium">

          Ministerio de Economía - Dirección General de Cómputos

        </p>
        </div>
      </div>
    </footer>
  );
}