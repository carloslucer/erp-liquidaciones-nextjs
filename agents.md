# AGENTS – UI STYLE GUIDE  
Estética corporativa tipo Tango Gestión / ERP moderno  
Versión: 1.1 – UX optimizada

-------------------------------------------------
1. PRINCIPIOS
-------------------------------------------------
- Serio, limpio, empresarial  
- Nada de grises muertos  
- Contraste suave, sin neón  
- Excel vibes + sistema contable real  
- Todo respira orden y control  
- El usuario entiende qué hacer sin pensar  
- Cada pantalla tiene un foco claro (1 acción principal)

-------------------------------------------------
2. JERARQUÍA VISUAL
-------------------------------------------------
- Título de pantalla = foco primario
- Formulario = bloque visual principal
- Resultados = secundarios hasta que haya datos
- Espacios en blanco intencionales (respiran)
- Nada compite con el botón principal

-------------------------------------------------
3. PALETA DE COLORES
-------------------------------------------------
Fondo principal:   #F5F7FA  
Tarjetas:          #FFFFFF  
Bordes:            #D0D7E2  
Texto principal:  #1F2933  
Texto secundario: #6B7280  

Primario (azul):   #2563EB  
Hover primario:   #1D4ED8  
Azul suave:       #3B82F6  

Éxito:            #16A34A  
Error:            #DC2626  
Warning:          #F59E0B  

-------------------------------------------------
4. TIPOGRAFÍA
-------------------------------------------------
General:   Inter / Segoe UI  
Tablas:    JetBrains Mono (opcional)  
Títulos:   Inter Semibold  
Labels:    Inter Medium  

Tamaños:
- Título pantalla: 18px  
- Título sección: 16px  
- Label: 13px  
- Texto: 14px  
- Tabla: 13px  

-------------------------------------------------
5. LAYOUT
-------------------------------------------------
- Fondo general: #F5F7FA  
- Todo en cards blancas  
- Margen entre secciones: 24px  
- Radio bordes: 8px  
- Sombra:
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);

-------------------------------------------------
6. CARDS
-------------------------------------------------
.card {
  background: #fff;
  border: 1px solid #D0D7E2;
  border-radius: 8px;
  padding: 16px;
  max-width: 100%;
  overflow: hidden;
}

-------------------------------------------------
7. INPUTS
-------------------------------------------------
.input {
  height: 40px;
  border: 1px solid #D0D7E2;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
  max-width: 100%;
}
.input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 2px rgba(37,99,235,.15);
}

.helper-text {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.input.error {
  border-color: #DC2626;
}
.input.success {
  border-color: #16A34A;
}

-------------------------------------------------
8. BOTONES
-------------------------------------------------
.btn-primary {
  background: #2563EB;
  color: #fff;
  border-radius: 6px;
  padding: 10px 18px;
  height: 44px;
  box-shadow: 0 2px 6px rgba(37,99,235,.35);
}
.btn-primary:hover {
  background: #1D4ED8;
}

.btn-secondary {
  background: #E5EAF3;
  color: #1F2933;
}

-------------------------------------------------
9. ESTADOS
-------------------------------------------------
Estado vacío:
🔍 Aún no hay resultados  
Ingresá los datos para comenzar.

Estado cargando:
Spinner + “Buscando datos…”

Estado error:
Fondo rojo suave + mensaje claro.

-------------------------------------------------
10. TABLAS
-------------------------------------------------
Header:     #E5EAF3  
Borde:      1px solid #D0D7E2  
Hover fila: #F1F5F9  
Zebra:      #FAFBFC  

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}

-------------------------------------------------
11. TÍTULOS DE SECCIÓN
-------------------------------------------------
.section-title {
  font-size: 15px;
  font-weight: 600;
  border-left: 4px solid #2563EB;
  padding-left: 8px;
}

-------------------------------------------------
12. SIDEBAR
-------------------------------------------------
- Ítem activo con fondo + barra lateral azul
- Íconos 16px
- Hover con fondo sutil

-------------------------------------------------
13. SENSACIÓN FINAL
-------------------------------------------------
Sistema serio, moderno, ordenado.  
Parece estatal, funciona como fintech.

-------------------------------------------------
14. RESPONSIVE
-------------------------------------------------
@media (max-width: 1024px) {
  .table th, .table td { font-size: 12px; }
}
@media (max-width: 768px) {
  .section-title { font-size: 14px; }
  .card { padding: 12px; }
}

-------------------------------------------------
## 15. MICRO-ANIMACIONES DE CARGA (CLAVE UX)
-------------------------------------------------

### Skeleton loader (tablas y cards)

.skeleton {
  position: relative;
  overflow: hidden;
  background: #E5EAF3;
  border-radius: 4px;
}

.skeleton::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150px;
  height: 100%;
  width: 150px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.6),
    transparent
  );
  animation: shimmer 1.3s infinite;
}

@keyframes shimmer {
  0% { left: -150px; }
  100% { left: 100%; }
}

Uso:
- Mostrar 8–10 filas fantasma mientras corre el GET.
- Reemplazar por datos reales con fade.

---

### Fade-in al llegar datos

.fade-enter {
  opacity: 0;
  transform: translateY(4px);
}
.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all .25s ease-out;
}

---

### Loader profesional (si no hay tabla)

.erp-loader {
  display: flex;
  gap: 6px;
}
.erp-dot {
  width: 8px;
  height: 8px;
  background: #2563EB;
  border-radius: 50%;
  animation: pulse 1.4s infinite;
}
.erp-dot:nth-child(2){ animation-delay:.2s }
.erp-dot:nth-child(3){ animation-delay:.4s }

@keyframes pulse {
  0%{opacity:.3}
  50%{opacity:1}
  100%{opacity:.3}
}

Texto sugerido:
“Preparando información…”

---

### Estado visual de card mientras procesa

.card.loading {
  filter: grayscale(.2);
  opacity: .85;
  pointer-events: none;
}
