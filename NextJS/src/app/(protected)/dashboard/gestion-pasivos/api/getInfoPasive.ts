"use server";
import { apiFetchGet } from "@/lib/utils";
import { ApiResponse, Code, Family, Motion } from "./../../../../types/types";
import { Blob } from "buffer";

export const getPasiveSearch = async <T>({
  searchParams,
}: {
  searchParams: string;
}) => {
  const url = searchParams && `employee/pasivo/?${searchParams}`;
  return await apiFetchGet<T>(url);
};

export const getCodeListPasiveSearch = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Code[]>> => {
  return await apiFetchGet<Code[]>(`cargos/pasivo/?${searchParams}`);
};
export const getInternalReasonPasive = async (): Promise<
  ApiResponse<Motion[]>
> => {
  return await apiFetchGet<Motion[]>("motivos/estatus/pasivos/");
};
export const getFamilyPasive = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Family[]>> => {
  const url = searchParams
    ? `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Passivefamily/?${searchParams}`
    : `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Passivefamily/`;
  const response = await fetch(url);
  const getResponse: ApiResponse<Family[]> = await response.json();
  return getResponse;
};

export const getFamilyPasiveOne = async (id: number) => {
  return await apiFetchGet<Family[]>(`Passivefamily/${id}`);
};

export const getExcel = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}reportes/excel/`,
  );
  const getResponse = await response.blob();
  return getResponse;
};
