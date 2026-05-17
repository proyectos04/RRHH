"use server";

import z from "zod";
import { schemaStatusChange } from "../schema/schemaChangeStatus";
import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";

export default async function ChangeStatusAction(
  values: z.infer<typeof schemaStatusChange>,
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
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}historyEmployee/Estatus/${values.cargo}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estatus_id: values.estatus_id,
          usuario_id: userId,
          motivo: values.motivo,
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
