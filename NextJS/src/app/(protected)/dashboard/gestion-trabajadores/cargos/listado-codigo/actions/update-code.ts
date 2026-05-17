"use server";

import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";
import { UpdateCodeTable } from "../schema/schema-update-code";

export async function updateCodeTable(values: UpdateCodeTable, id: number) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }
    const { ...valuesNotCode } = values;
    const userId = Number.parseInt(session.user.id);
    const payload = {
      usuario_id: userId,
      ...valuesNotCode,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}codigos/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
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
      message: "Ocurrio un error",
    };
  }
}
