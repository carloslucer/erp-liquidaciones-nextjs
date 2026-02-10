'use client'

import { useState, useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'
import { FiMenu, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { BsFiletypeXml } from "react-icons/bs";
import { IoMdHome, IoIosArchive } from "react-icons/io";
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock } from 'react-icons/fi'
import MenuContent from '@/app/components/MenuContent'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [declaracionOpen, setDeclaracionOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const closeMobile = () => setMobileOpen(false)
  


  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const isActive = (href) => pathname === href
  const desktopWidth = collapsed ? 64 : 256
 return (
    <>
      {/* ✅ MOBILE TOPBAR */}
      <aside className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl">
        {/* header + botón */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-extrabold tracking-wide">SIG</div>
            <div className="text-xs leading-tight text-white/90">
              <div className="font-semibold tracking-wide">SISTEMA DE IMPUESTOS</div>
              <div className="tracking-wide">A LAS GANANCIAS</div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              className="border-b border-gray-700"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MenuContent
                collapsed={false}
                declaracionOpen={declaracionOpen}
                setDeclaracionOpen={setDeclaracionOpen}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* ✅ DESKTOP SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: desktopWidth }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="hidden md:flex md:flex-col md:h-screen md:shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl overflow-hidden"
        style={{ width: desktopWidth }}
      >
        {/* header + botón colapsar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-extrabold tracking-wide">SIG</div>
              <div className="text-xs leading-tight text-white/90">
                <div className="font-semibold tracking-wide">SISTEMA DE IMPUESTOS</div>
                <div className="tracking-wide">A LAS GANANCIAS</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <MenuContent
            collapsed={collapsed}
            declaracionOpen={declaracionOpen}
            setDeclaracionOpen={setDeclaracionOpen}
            pathname={pathname}
            onNavigate={() => {}}
            onLogout={handleLogout}
          />
        </nav>
      </motion.aside>
    </>
  )
}
