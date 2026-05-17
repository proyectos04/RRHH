"use server";

import { ApiResponse } from "@/app/types/types";
import { TypeSchemaUpdateUser } from "../tableUser/updateInfo/schema/schemaUpdateUser";
import { revalidatePath } from "next/cache";
import { is } from "date-fns/locale";

export default async function updateAction(
  values: TypeSchemaUpdateUser,
  id: number,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}accounts/usuarios/${id}/`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
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

export async function blockUserAction(id: number, is_active: boolean) {
  const payload = {
    is_active: !is_active,
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}accounts/usuarios/estado/${id}/`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify(payload),
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
  } catch (error) {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
