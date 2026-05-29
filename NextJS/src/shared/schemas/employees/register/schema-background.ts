import { z } from "zod";

export const schemaBackgroundItem = z.object({
  fecha_ingreso: z.date().optional(),
  fecha_egreso: z.date().optional(),
  organismo_id: z
    .number({ message: "Seleccione un organismo" })
    .optional(),
  nuevo_organismo_nombre: z.string().optional(),
});

export const schemaBackground = z.object({
  antecedentes: z.array(schemaBackgroundItem).optional(),
});
export type BackgroundType = z.infer<typeof schemaBackground>;
