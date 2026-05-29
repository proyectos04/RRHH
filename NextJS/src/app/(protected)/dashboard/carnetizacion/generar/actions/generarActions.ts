"use server";

import { auth } from "#/auth";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api-client";
import type { VistaPreviaResponse, UploadFotoResponse } from "../../types/carnetizacion";

const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER;

export async function actualizarVistaPrevia(cedula: string, nombre: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión." };
    }
    const data = await apiFetch<VistaPreviaResponse>(`carnetizacion/actualizar-vista-previa/${cedula}/`, {
      method: "POST",
      body: JSON.stringify({ nombre, cedula }),
    });
    if (data.success) {
      return { success: true as const, message: "Vista previa actualizada", vista_previa: data.vista_previa };
    }
    return { success: false as const, message: "Error al actualizar vista previa" };
  } catch {
    return { success: false as const, message: "Error al actualizar vista previa" };
  }
}

export async function subirFoto(cedula: string, nombre: string, foto: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión." };
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("dj_access")?.value;
    const formData = new FormData();
    formData.append("foto", foto);
    formData.append("nombre", nombre);
    formData.append("cedula", cedula);
    const res = await fetch(`${API_URL}carnetizacion/subir-foto/${cedula}/`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data: UploadFotoResponse = await res.json();
    if (data.success) {
      return { success: true as const, message: "Foto actualizada correctamente", vista_previa: data.vista_previa };
    }
    return { success: false as const, message: data.error || "Error al subir foto" };
  } catch {
    return { success: false as const, message: "Error al subir la foto" };
  }
}

export async function registrarSolicitud(cedula: string, motivo_id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión." };
    }
    const data = await apiFetch<{ success: boolean }>(`carnetizacion/registrar-solicitud/${cedula}/`, {
      method: "POST",
      body: JSON.stringify({ motivo_id, observaciones: "" }),
    });
    if (data.success) return { success: true as const, message: "Solicitud registrada" };
    return { success: false as const, message: "Error al registrar solicitud" };
  } catch {
    return { success: false as const, message: "Error al registrar solicitud" };
  }
}

export async function generarCarnet(cedula: string, motivo_id: number, nombre: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, message: "No tienes permiso para realizar esta acción. Inicia sesión.", data: null };
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("dj_access")?.value;
    const res = await fetch(`${API_URL}carnetizacion/generar/${cedula}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ motivo_id, observaciones: "", datos_editados: { nombre, cedula } }),
    });
    if (!res.ok) return { success: false as const, message: "Error al generar el carnet", data: null };
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return { success: true as const, message: "Carnet generado exitosamente", data: base64 };
  } catch {
    return { success: false as const, message: "Error al generar el carnet", data: null };
  }
}
