"use server";

import z from "zod";
import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";
import { schemaCodePasive } from "../schemas/schemaCode";

export async function createCodePasiveAction(
  values: z.infer<typeof schemaCodePasive>,
) {
  try {
    const { success, error } = schemaCodePasive.safeParse(values);
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    if (!success) {
      return {
        success: false,
        message: error.message,
      };
    }
    const payload = { ...values, usuario_id: userId };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/pasivo/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: getResponse.message || "Error al crear el código.",
      };
    }
    return {
      success: true,
      message: getResponse.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio un error Inesperado",
    };
  }
}
