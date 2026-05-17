import { z } from "zod";
export const schemaBackgroundDate = z
  .object({
    institucion: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    fecha_ingreso: z
      .date({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
    fecha_egreso: z
      .date({
        message: "Debe Ingresar Información Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_ingreso && data.fecha_egreso) {
      if (data.fecha_egreso <= data.fecha_ingreso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La Fecha De Egreso No Puede Ser Anterior A La Fecha De Ingreso",
          path: ["fecha_egreso"],
        });
      }
      if (!data.institucion || data.institucion.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe Ingresar Información Valida",
          path: ["institucion"],
        });
      }
    }
    if (data.fecha_ingreso) {
      if (!data.fecha_egreso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe Seleccionar Una Fecha De Egreso",
          path: ["fecha_egreso"],
        });
      }
    }
    if (data.fecha_egreso) {
      if (!data.fecha_ingreso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe Seleccionar Una Fecha De Ingreso",
          path: ["fecha_ingreso"],
        });
      }
    }
  });

export const schemaBackground = z
  .object({
    fechaingresoorganismo: z.date({
      message: "Debe Ingresar Una Fecha Requerida",
      required_error: "La Fecha Es Requerida",
    }),
    antecedentes: z.array(schemaBackgroundDate).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.antecedentes && data.antecedentes.length > 0) {
      const fechaReferencia = data.fechaingresoorganismo.getTime();
      const hasConflict = data.antecedentes.some((item) => {
        const ingresoAntecedente = item.fecha_ingreso?.getTime();
        const egresoAntecedente = item.fecha_egreso?.getTime();
        return (
          ingresoAntecedente === fechaReferencia ||
          egresoAntecedente === fechaReferencia
        );
      });

      if (hasConflict) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La Fecha de Ingreso al Organismo no puede coincidir con el ingreso o egreso de sus antecedentes. Solo registre el último antecedente en la Administración Pública.",
          path: ["fechaingresoorganismo"],
        });
      }
    }
  });
export type BackgroundType = z.infer<typeof schemaBackground>;
