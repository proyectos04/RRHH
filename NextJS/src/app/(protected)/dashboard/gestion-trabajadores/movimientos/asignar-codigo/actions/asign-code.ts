"use server";

import z from "zod";
import { schemaAsignCode } from "../schema/schema-asign-code";
import { auth } from "#/auth";
import { ApiResponse } from "@/app/types/types";

export async function AsignCode(values: z.infer<typeof schemaAsignCode>) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }
    const userId = Number.parseInt(session.user.id);
    const payload = {
      usuario_id: userId,
      employee: values.employee,
      encargaduria: values.encargaduria,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}asignar_codigo/${values.code}/`,
      {
        method: "PATCH",
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
      message: "Ocurrio Un Error",
    };
  }
}
