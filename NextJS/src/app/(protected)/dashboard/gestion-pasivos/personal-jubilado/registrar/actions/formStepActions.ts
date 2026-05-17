"use server";
import { auth } from "#/auth";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { FamilyEmployeeType } from "../schemas/schema-family_employee";
import { ApiResponse } from "@/app/types/types";
export async function registerEmployeeSteps(
  data: BasicInfoType &
    AcademyType &
    BackgroundType &
    HealthType &
    PhysicalProfileType &
    DwellingType &
    FamilyEmployeeType,
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
    const {
      apellidos,
      cedulaidentidad,
      datos_vivienda,
      estadoCivil,
      fecha_nacimiento,
      fechaingresoorganismo,
      file,
      formacion_academica,
      n_contrato,
      nombres,
      perfil_fisico,
      perfil_salud,
      sexoid,
      antecedentes,
      familys,
    } = data;
    const payloadEmployee = {
      apellidos,
      cedulaidentidad,
      datos_vivienda,
      estadoCivil,
      fecha_nacimiento,
      fechaingresoorganismo,
      profile: file.name,
      formacion_academica,
      n_contrato,
      nombres,
      perfil_fisico,
      perfil_salud,
      sexoid,
      usuario_id: userId,
      antecedentes,
    };

    const payloadFamily = {
      familys: familys?.map((familiar) => ({
        ...familiar,
        usuario_id: userId,
        employeecedula: cedulaidentidad,
      })),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}employees_register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payloadEmployee,
        }),
      },
    );
    const getEmployee: ApiResponse<never> = await response.json();
    const formData = new FormData();
    formData.append("file", data.file!);
    const responseNestjs = await fetch(
      `${process.env.NEXT_PUBLIC_NEST_API_URL_SERVER}file-save/upload/profile/${data.cedulaidentidad}`,

      {
        method: "POST",
        body: formData,
      },
    );

    const responseFamily = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employeefamily/masivo/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadFamily.familys),
      },
    );
    const getFamily: ApiResponse<never> = await responseFamily.json();
    return {
      success: response.ok && responseFamily.ok,
      message:
        response.ok && responseFamily.ok && responseNestjs.ok
          ? getEmployee.message
          : getEmployee.message ||
            getFamily.message ||
            "Error al registrar empleado",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error ",
    };
  }
}
