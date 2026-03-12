"use client";

import UploadPDF from "@/app/components/UploadPDF";
import RoleGuard from "@/app/components/RoleGuard";

export default function ImportarPdfPage() {
  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR"]}>
      <UploadPDF />
    </RoleGuard>
  );
}
