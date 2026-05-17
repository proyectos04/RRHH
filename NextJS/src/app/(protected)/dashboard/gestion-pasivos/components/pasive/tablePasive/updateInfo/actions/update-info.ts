"use server";

import { auth } from "#/auth";
import { AcademyUpdateUpdateType } from "../schema/schema-academic_training";
import { BackgroundUpdateType } from "../schema/schema-background";
import { DwellingUpdateType } from "../schema/schema-dwelling";
import { HealthUpdateType } from "../schema/schema-health_profile";
import { PhysicalProfileUpdateType } from "../schema/schema-physical_profile";
import { BasicInfoUpdateType } from "../schema/schemaEmployeeUpdate";

export default async function updateInfoEmployee(
  data:
    | PhysicalProfileUpdateType
    | BackgroundUpdateType
    | HealthUpdateType
    | DwellingUpdateType
    | AcademyUpdateUpdateType
    | BasicInfoUpdateType,
  idEmployee: string,
  cedulaidentidad?: string,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employee/${idEmployee}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          usuario_id: userId,
        }),
      },
    );
    const getResponse = await response.json();
    if ("file" in data && data.file !== null && data.file !== undefined) {
      const formData = new FormData();
      formData.append("file", data.file!);
      await fetch(
        `${process.env.NEXT_PUBLIC_NEST_API_URL_SERVER}file-save/upload/profile/${cedulaidentidad}`,

        {
          method: "POST",
          body: formData,
        },
      );

      await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employee/${idEmployee}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: data.file.name,
            usuario_id: userId,
          }),
        },
      );
    }

    if (response.ok) {
      return {
        success: true,
        message: getResponse.message,
      };
    }
    return {
      success: false,
      message:
        getResponse.message ||
        "Error al actualizar la información del empleado.",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
