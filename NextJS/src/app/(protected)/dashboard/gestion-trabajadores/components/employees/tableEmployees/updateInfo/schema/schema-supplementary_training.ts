import { z } from "zod";

export const schemaSupplementaryTrainingDateUpdate = z
  .object({
    institucion: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    capacitacion: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    fecha_inicio: z
      .date({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
    fecha_fin: z
      .date({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_inicio && data.fecha_fin) {
      if (data.fecha_fin < data.fecha_inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de fin no puede ser anterior a la de inicio",
          path: ["fecha_fin"],
        });
      }
      if (!data.institucion || data.institucion.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe ingresar la institución",
          path: ["institucion"],
        });
      }
    }
    if (data.fecha_inicio && !data.fecha_fin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar una fecha de fin",
        path: ["fecha_fin"],
      });
    }
    if (data.fecha_fin && !data.fecha_inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar una fecha de inicio",
        path: ["fecha_inicio"],
      });
    }
  });

export const schemaSupplementaryTrainingUpdate = z.object({
  formacion_complementaria: z.array(schemaSupplementaryTrainingDateUpdate).optional(),
});
export type SupplementaryTrainingUpdateType = z.infer<
  typeof schemaSupplementaryTrainingUpdate
>;
