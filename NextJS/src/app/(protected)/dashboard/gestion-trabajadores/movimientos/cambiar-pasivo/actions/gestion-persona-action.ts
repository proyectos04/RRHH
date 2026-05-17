"use server";
import z from "zod";
import { schemaPasivo } from "../schema/schemaPasivo";
import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";

export default async function GestionAction(
  values: z.infer<typeof schemaPasivo>,

  employee: string,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }
    const payload = {
      ...values,
      usuario_id: Number.parseInt(session.user.id),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}historyEmployee/egreso/${employee}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
        }),
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
