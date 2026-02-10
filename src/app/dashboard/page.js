import { PageShell, SectionHeader } from "../components/CorporateUI";

export default function DashboardPage() {
  return (
    <div className="flex justify-center items-center p-5">
    <PageShell>
      <SectionHeader
        title="Panel principal"
        subtitle="Seleccione una opción del menú para continuar."
      />

      <div className="border border-[#D0D7E2] bg-[#FFFFFF] rounded-md px-6 py-6 text-sm text-[#1F2933] space-y-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)] ">
        <div>
          <p className="font-semibold text-[#1F2933] text-base">Bienvenido al sistema SIG</p>
        </div>
        <p className="text-[#6B7280] leading-relaxed">
          Utilice el menú lateral para acceder a las consultas de agentes, planillas o declaraciones.
          Mantenga los datos actualizados y respete el flujo administrativo establecido.
        </p>
        <p className="text-xs text-[#6B7280]">
          Recuerde cerrar la sesión al finalizar su trabajo.
        </p>
      </div>
    </PageShell>
    </div>
  );
}


