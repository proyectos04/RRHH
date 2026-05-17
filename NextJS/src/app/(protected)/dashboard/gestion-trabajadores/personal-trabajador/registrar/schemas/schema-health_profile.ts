import { z } from "zod";

export const schemaHealthProfile = z.object({
  perfil_salud: z.object({
    grupoSanguineo: z
      .number({
        message: "Debe seleccionar un grupo sanguíneo",
      })
      .min(1, "Debe seleccionar un grupo sanguíneo"),
    patologiaCronica: z.array(z.number()).default([]),
    alergias: z.array(z.number()).default([]),

    discapacidad: z.array(z.number()).default([]),
  }),
});
export type HealthType = z.infer<typeof schemaHealthProfile>;
