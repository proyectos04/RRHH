import { apiFetchGet } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, Pregunta } from "@/app/types/types";

export const getPreguntas = async (): Promise<ApiResponse<Pregunta[]>> => {
  return apiFetchGet<Pregunta[]>("autogestion/preguntas/");
};

interface CensoEmpleadoData {
  empleado_cedula: string;
  carnet_patria: string;
  respuestas: {
    pregunta_id: number;
    pregunta: string;
    tipo: string;
    opcion_id: number | null;
    opcion: string | null;
    respuesta: string;
  }[];
}

export const consultarCensoEmpleado = async (cedula: string) => {
  return apiFetchGet<CensoEmpleadoData>(
    `autogestion/censo-vivienda/consultar/${cedula}/`,
  );
};

interface RespuestaItem {
  pregunta: number;
  opcion: number | null;
  respuesta: string;
}

interface ViviendaData {
  direccion_exacta?: string;
  estado_id?: number;
  municipio_id?: number;
  parroquia?: number;
  condicion_vivienda_id?: number;
  codigo_postal?: string;
}

interface SubmitPayload {
  carnet_patria: string;
  datos_vivienda: ViviendaData;
  respuestas: RespuestaItem[];
}

export const submitCensoVivienda = async (
  cedula: string,
  payload: SubmitPayload,
) => {
  return apiFetch<{ status: string; message: string }>(
    `autogestion/censo-vivienda/${cedula}/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};
