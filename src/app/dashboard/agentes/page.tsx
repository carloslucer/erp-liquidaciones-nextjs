"use client";

import BuscarAgente from "@/app/components/BuscarAgente";
import RoleGuard from "@/app/components/RoleGuard";

export default function AgentePage() {
    return (
        <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR", "CLIENTE"]}>
            <div className="flex justify-center items-center px-10 ">
                <div className="flex justify-center items-center h-[95vh] w-full ">
                    <BuscarAgente />
                </div>
            </div>
        </RoleGuard>
    );
}
