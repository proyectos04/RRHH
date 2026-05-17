import { ApiResponse } from "@/app/types/types";

import { CategoryGroup } from "../schemas/schemaCategory";
import { PatologySchema } from "../schemas/schemaPatologys";

export async function patologyCreateActions(values: PatologySchema) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Patologias/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
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
      message: "Ocurrio Un Error en el servidor",
    };
  }
}

export async function patologyGroup(values: CategoryGroup) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}patologias/categorias/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
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
      message: "Ocurrio Un Error en el servidor",
    };
  }
}
