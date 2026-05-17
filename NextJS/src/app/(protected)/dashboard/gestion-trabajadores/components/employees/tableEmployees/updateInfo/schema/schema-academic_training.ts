import { z } from "zod";

export const schemaAcademyUpdate = z.object({
  formacion_academica: z.object({
    nivel_Academico_id: z
      .number({
        message: "Debe Seleccionar un Nivel Academico",
      })
      .optional(),
    carrera_id: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    mencion_id: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    capacitacion: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    institucion: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
  }),
});
export type AcademyUpdateUpdateType = z.infer<typeof schemaAcademyUpdate>;
