import { REGEX_LETTERS } from "@/lib/regex";
import { z } from "zod";

export const schemaFormacionComplementaria = z
  .object({
    institucion: z
      .string({
        message: "Debe ingresar información válida",
      })
      .regex(REGEX_LETTERS, { message: "Solo se permiten letras" })
      .optional(),
    capacitacion: z
      .string({
        message: "Debe ingresar información válida",
      })
      .regex(REGEX_LETTERS, { message: "Solo se permiten letras" })
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
    // 1. Validación de coherencia de fechas
    if (data.fecha_inicio && data.fecha_fin) {
      if (data.fecha_fin < data.fecha_inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de fin no puede ser anterior a la de inicio",
          path: ["fecha_fin"],
        });
      }

      // 2. Si hay fechas, la institución se vuelve obligatoria
      if (!data.institucion || data.institucion.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe ingresar la institución",
          path: ["institucion"],
        });
      }
    }

    // 3. Validación de campos dependientes (si pones uno, debes poner el otro)
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

export const schemaSupplementaryTraining = z.object({
  formacion_complementaria: z.array(schemaFormacionComplementaria).optional(),
});
export type SupplementaryTrainingType = z.infer<
  typeof schemaSupplementaryTraining
>;