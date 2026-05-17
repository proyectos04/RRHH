import { z } from "zod";

export const schemaAcademy = z.object({
  formacion_academica: z.object({
    nivel_Academico_id: z
      .number({
        message: "Debe Seleccionar un Nivel Academico",
        required_error: "Este Campo Es Requerido",
      })
      .min(1, {
        message: "Debe Seleccionar un Nivel Academico",
      }),
    carrera_id: z
      .number({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
    mencion_id: z
      .number({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
    capacitacion: z
      .string({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
    institucion: z
      .string({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
  }),
});
export type AcademyType = z.infer<typeof schemaAcademy>;
