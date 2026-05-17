import { ApiResponse } from "@/app/types/types";

import { CategoryGroup } from "../schemas/schemaCategory";
import { AllergiesSchema } from "../schemas/schemaAllergies";

export async function allergiesCreateActions(values: AllergiesSchema) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}alergias/`,
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

export async function allergiesGroup(values: CategoryGroup) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}alergias/categorias/`,
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
