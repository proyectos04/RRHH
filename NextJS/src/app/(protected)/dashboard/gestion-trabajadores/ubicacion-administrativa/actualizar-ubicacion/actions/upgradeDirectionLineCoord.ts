"use server";
import { ApiResponse } from "@/app/types/types";
import { SchemaUpgradeDireccionLineCoord } from "../schema/schemaUpdateDireccionLineCoord";

export default async function upgradeDirectionLineCoordAction(
  values: SchemaUpgradeDireccionLineCoord,
) {
  try {
    const { id, dependenciaId, ...withoutId } = values;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}DireccionLinea/${id}/`,
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
