"use client";

import PageLayout from "@/components/layout/page-layout";
import { PrestamoCargoForm } from "./prestamo-cargo-form";

export default function PrestamoCargoPage() {
  return (
    <PageLayout
      title="Préstamo de Cargo (Encargaduría)"
      description="Asigne temporalmente un cargo a un trabajador"
    >
      <PrestamoCargoForm />
    </PageLayout>
  );
}
