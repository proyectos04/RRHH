"use server";
import { z } from "zod";
import { schemaCodeEspecial } from "../schema/schemaCodeEspecial";
import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";
export async function AsignSpecialCode(
  values: z.infer<typeof schemaCodeEspecial>,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}asignacion_CodigoEspecia/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: userId }),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: getResponse.message,
      };
    }
    return {
      success: false,
      message: getResponse.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
