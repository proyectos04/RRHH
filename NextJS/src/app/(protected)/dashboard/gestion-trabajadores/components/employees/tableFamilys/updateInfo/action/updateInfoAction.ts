"use server";

import { ApiResponse } from "@/app/types/types";
import { HealthUpdateFamilyType } from "../schema/schema-health_profile";
import { TypeSchemaUpdateAcademy } from "../schema/schemaAcademyUpdate";
import { SchemaUpdatePhysical } from "../schema/schemaPhysicalUpdate";
import { UpdateInfoFormValues } from "../schema/updateInfoSchema";
import { SchemaUpdateRelaction } from "../schema/updateRelationSchema";

export default async function updateInfoAction({
  values,
  idFamily,
}: {
  values:
    | HealthUpdateFamilyType
    | TypeSchemaUpdateAcademy
    | SchemaUpdatePhysical
    | UpdateInfoFormValues
    | SchemaUpdateRelaction;
  idFamily: number;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employeefamily/${idFamily}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();
    if (getResponse.status === "Ok") {
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
      message: "Error al actualizar la información",
    };
  }
}
