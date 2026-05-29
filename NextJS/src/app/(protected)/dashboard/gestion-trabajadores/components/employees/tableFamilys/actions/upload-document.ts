"use server";

import { cookies } from "next/headers";

export async function uploadFamilyDocument(formData: FormData) {
  const familiarId = formData.get("familiarId") as string;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("dj_access")?.value;

  if (!familiarId) {
    return { success: false, message: "ID de familiar no proporcionado" };
  }

  const uploadFormData = new FormData();
  uploadFormData.append("document_type", formData.get("document_type") as string);
  uploadFormData.append("file", formData.get("file") as File);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employeefamily/${familiarId}/documentos/`,
      {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: uploadFormData,
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Error desconocido" }));
      return { success: false, message: err.message || err.detail || "Error al subir documento" };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message || "Error de conexion" };
  }
}
