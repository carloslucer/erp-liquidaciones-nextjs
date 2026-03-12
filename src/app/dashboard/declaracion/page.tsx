"use client";

import RoleGuard from "@/app/components/RoleGuard";
import UploadXML from "@/app/components/UploadXML";

export default function DeclaracioPage() {
  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR"]}>
      <UploadXML />
    </RoleGuard>
  );
}
