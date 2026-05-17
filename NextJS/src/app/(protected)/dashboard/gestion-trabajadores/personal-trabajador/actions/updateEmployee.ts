"use server";

import { ApiResponse } from "@/app/types/types";
import z from "zod";
import { schemaEmployeeEdit } from "../registrar/schemas/schemaRac";

export async function updateEmployee(
  values: z.infer<typeof schemaEmployeeEdit>,
  cedula: string,
) {
  try {
    const { success } = schemaEmployeeEdit.safeParse(values);
    if (!success) {
      return {
        success: false,
        message: "Error En Los Campos De Actualizacion",
      };
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}empleados-actualizar/${cedula}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      },
    );
    const message: ApiResponse<string> = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: message.message,
      };
    }
    return {
      success: true,
      message: message.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio un error",
    };
  }
}
