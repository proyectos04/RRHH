import z from "zod";

export const schemaUpdateAcademy = z.object({
  formacion_academica_familiar: z.object({
    institucion: z.string().optional(),
    capacitacion: z.string().optional(),
    nivel_Academico_id: z.coerce.number().optional(),
    carrera_id: z.coerce.number().optional(),
    mencion_id: z.coerce.number().optional(),
  }),
});

export type TypeSchemaUpdateAcademy = z.infer<typeof schemaUpdateAcademy>;
