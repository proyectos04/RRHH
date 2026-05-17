import { ApiResponse } from "@/app/types/types";
import { DisabitySchema } from "../schemas/schemaDisability";
import { CategoryGroup } from "../schemas/schemaCategory";

export async function disabilityCreateActions(values: DisabitySchema) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Discapacidades/`,
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

export async function disabilityGroup(values: CategoryGroup) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}discapacidad/categorias/`,
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
