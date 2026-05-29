"use server";

import { auth } from "#/auth";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER;

export async function subirPlantilla(nombre: string, imagen: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión." };
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("dj_access")?.value;
    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("imagen", imagen);
    const res = await fetch(`${API_URL}carnetizacion/api/plantillas/crear/`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) return { success: true as const, message: "Plantilla subida exitosamente" };
    return { success: false as const, message: "Error al subir la plantilla" };
  } catch {
    return { success: false as const, message: "Error al subir la plantilla" };
  }
}

export async function activarPlantilla(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión." };
    }
    const data = await apiFetch<{ success: boolean }>(`carnetizacion/api/plantillas/${id}/activar/`, {
      method: "POST",
    });
    if (data.success) return { success: true as const, message: "Plantilla activada exitosamente" };
    return { success: false as const, message: "Error al activar plantilla" };
  } catch {
    return { success: false as const, message: "Error al activar plantilla" };
  }
}
