"use server";

import { ApiResponse } from "@/app/types/types";
import { TypeSchemaRegister } from "../schema/schemaRegister";

export default async function registerAction(values: TypeSchemaRegister) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}accounts/registro/`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(values),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();
    if (!(getResponse.status === "success")) {
      return {
        success: false,
        message: getResponse.message,
      };
    }
    return {
      success: true,
      message: getResponse.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
