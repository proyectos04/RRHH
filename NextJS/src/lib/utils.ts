import { ApiResponse } from "@/app/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calcularEdad = (fechaNacimiento: string | number | undefined) => {
  return (
    new Date().getFullYear() -
    new Date(fechaNacimiento ? fechaNacimiento : "00/00/0000").getFullYear()
  );
};

export const apiFetchGet = async <T>(url: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}${url}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  const getResponse: ApiResponse<T> = await response.json();
  return getResponse;
};
