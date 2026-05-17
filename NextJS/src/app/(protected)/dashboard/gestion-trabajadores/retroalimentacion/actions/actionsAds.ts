import { ApiResponse } from "@/app/types/types";
import { AdsType, AdsUpdateType } from "../schemas/schemaAds";

export async function adsCreateActions(values: AdsType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}OrganismoAdscrito/`,
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
export async function adsUpdateActions(values: AdsUpdateType) {
  try {
    const { id, ...ads } = values;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}OrganismoAdscrito/${id}/`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...ads }),
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
