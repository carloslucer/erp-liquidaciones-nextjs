import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiMenu, FiChevronDown, FiChevronRight, FiFileText, FiUpload, FiUsers } from 'react-icons/fi'
import { IoMdHome, IoIosArchive } from "react-icons/io";
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock } from 'react-icons/fi'
import { puedeLiquidar, puedeSubirArchivos, puedeAdministrarUsuarios } from '@/app/lib/roles'

export default function MenuContent({ collapsed, declaracionOpen, setDeclaracionOpen, declaracion572Open, setDeclaracion572Open, usuariosOpen, setUsuariosOpen, pathname, onNavigate, onLogout, rol }) {
    const isActive = (href) => pathname === href
    const isPlanillasActive = pathname.startsWith('/dashboard/agentes') || pathname.startsWith('/dashboard/planilla')
    const isDeclaracion572Active = pathname.startsWith('/dashboard/declaracion')
    const isUsuariosActive = pathname.startsWith('/dashboard/usuarios')

    const canLiquidar = puedeLiquidar(rol)
    const canUpload = puedeSubirArchivos(rol)
    const canAdmin = puedeAdministrarUsuarios(rol)

    return (
        <>
            <Link
                href="/dashboard"
                onClick={onNavigate}
                className={`flex items-center gap-3 px-2 py-3 m-2 rounded-lg transition-colors duration-200
          ${isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                <span className="text-xl"><IoMdHome /></span>
                {!collapsed && <span className="font-medium">Inicio</span>}
            </Link>

            <div className="px-2">
                {/* ═══ Planillas de Liquidación ═══ (todos ven consulta, solo liquidador/admin ve buscar agentes) */}
                <button
                    onClick={() => setDeclaracionOpen(!declaracionOpen)}
                    className={`flex items-center w-full gap-3 px-2 py-2 rounded-lg transition-colors duration-200
            ${isPlanillasActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                    <span className="text-xl"><FiFileText /></span>
                    {!collapsed && (
                        <>
                                <span className="flex-1 text-left font-medium">Planillas de Liquidacion</span>
                            {declaracionOpen ? <FiChevronDown /> : <FiChevronRight />}
                        </>
                    )}
                </button>

                <AnimatePresence initial={false}>
                    {declaracionOpen && !collapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-1 mt-1 space-y-1 bg-gradient-to-b to-gray-700 overflow-hidden rounded"
                        >
                            <Link
                                href="/dashboard/agentes"
                                onClick={onNavigate}
                                className={`block px-2 py-1 rounded text-sm ${isActive('/dashboard/agentes')
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                Buscar Agentes
                            </Link>

                            <Link
                                href="/dashboard/planilla"
                                onClick={onNavigate}
                                className={`block px-2 py-1 rounded text-sm ${isActive('/dashboard/planilla')
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                Consultar Liquidacion
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══ Declaración 572 ═══ (solo LIQUIDADOR y ADMINISTRADOR) */}
                {canUpload && (
                    <>
                        <button
                            onClick={() => setDeclaracion572Open && setDeclaracion572Open(!declaracion572Open)}
                            className={`flex items-center w-full gap-3 px-2 py-2 mt-2 rounded-lg transition-colors duration-200
                    ${isDeclaracion572Active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <span className="text-xl"><FiUpload /></span>
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-left font-medium">Declaración 572</span>
                                    {declaracion572Open ? <FiChevronDown /> : <FiChevronRight />}
                                </>
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {declaracion572Open && !collapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 mt-1 space-y-1 bg-gradient-to-b to-gray-700 overflow-hidden rounded"
                                >
                                    <Link
                                        href="/dashboard/declaracion/importar-pdf"
                                        onClick={onNavigate}
                                        className={`block px-2 py-1 rounded text-sm ${isActive('/dashboard/declaracion/importar-pdf')
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        Importar PDF
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* ═══ Administración de Usuarios ═══ (solo ADMINISTRADOR) */}
                {canAdmin && (
                    <>
                        <button
                            onClick={() => setUsuariosOpen && setUsuariosOpen(!usuariosOpen)}
                            className={`flex items-center w-full gap-3 px-2 py-2 mt-2 rounded-lg transition-colors duration-200
                    ${isUsuariosActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <span className="text-xl"><FiUsers /></span>
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-left font-medium">Gestión de Usuarios</span>
                                    {usuariosOpen ? <FiChevronDown /> : <FiChevronRight />}
                                </>
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {usuariosOpen && !collapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 mt-1 space-y-1 bg-gradient-to-b to-gray-700 overflow-hidden rounded"
                                >
                                    <Link
                                        href="/dashboard/usuarios/registrar"
                                        onClick={onNavigate}
                                        className={`block px-2 py-1 rounded text-sm ${
                                            isActive('/dashboard/usuarios/registrar')
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        Registrar usuario
                                    </Link>

                                    <Link
                                        href="/dashboard/usuarios/lista"
                                        onClick={onNavigate}
                                        className={`block px-2 py-1 rounded text-sm ${
                                            isActive('/dashboard/usuarios/lista')
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        Usuarios registrados
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                <div className="mt-10 border-t border-gray-700 pt-3">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-600/80 hover:text-white transition"
                    >
                        <FiLock className="text-lg" />
                        {!collapsed && <span>Cerrar sesión</span>}
                    </button>
                </div>

            </div>

        </>
    )
}
