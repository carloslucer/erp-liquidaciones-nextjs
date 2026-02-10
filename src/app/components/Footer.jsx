export default function Footer({ dark = false }) {
  return (
    <footer className={`py-3 mt-auto ${dark ? 'text-white' : 'text-gray-700'} `}>
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-medium">
          Ministerio de Economía - Dirección General de Cómputos
        </p>
      </div>
    </footer>
  );
}
