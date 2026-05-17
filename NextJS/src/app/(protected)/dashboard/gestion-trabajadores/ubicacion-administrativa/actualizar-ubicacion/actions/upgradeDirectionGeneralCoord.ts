"use server";
import { ApiResponse } from "@/app/types/types";
import { SchemaUpgradeDireccionGeneralCoord } from "../schema/schemaUpdateDireccionGeneralCoord";

export default async function upgradeDirectionGeneralCoordAction(
  values: SchemaUpgradeDireccionGeneralCoord,
) {
  try {
    const { id, ...withoutId } = values;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}DireccionGeneral/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withoutId),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();
    if (!(getResponse.status == "success")) {
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
      message: "Error En El Servidor",
    };
  }
}
