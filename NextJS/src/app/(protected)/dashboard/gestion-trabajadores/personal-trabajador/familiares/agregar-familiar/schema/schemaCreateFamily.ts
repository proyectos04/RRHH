import z from "zod";

export const schemaFamilyEmployeeOne = z.object({
  cedulaFamiliar: z.string().optional(),
  primer_nombre: z.string().refine((v) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v), {
    message: "No Debe Ingresar Numeros",
  }),
  segundo_nombre: z
    .string()
    .refine((v) => !v || /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v), {
      message: "No Debe Ingresar Numeros",
    })
    .optional(),
  primer_apellido: z
    .string()
    .refine((v) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v), {
      message: "No Debe Ingresar Numeros",
    }),
  segundo_apellido: z
    .string()
    .refine((v) => !v || /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v), {
      message: "No Debe Ingresar Numeros",
    })
    .optional(),
  parentesco: z.number(),
  fechanacimiento: z.date({
    invalid_type_error: "Formato de fecha inválido",
  }),
  sexo: z.number(),
  estadoCivil: z.number(),
  observaciones: z
    .string()
    .refine((v) => !v || /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v), {
      message: "No Debe Ingresar Numeros",
    })
    .optional(),
  mismo_ente: z.boolean(),
  heredero: z.boolean().default(false),
  file_cedula: z.any().optional(),
  file_partida_nacimiento: z.any().optional(),
  perfil_salud_familiar: z
    .object({
      grupoSanguineo: z.number({
        message: "Debe seleccionar un grupo sanguíneo",
      }),
      patologiaCronica: z.array(z.number()).optional(),
      alergias: z.array(z.number()).optional(),

      discapacidad: z.array(z.number()).optional(),
    })
    .optional(),
  perfil_fisico_familiar: z
    .object({
      tallaCamisa: z.number({
        message: "Debe seleccionar una talla de camisa",
      }),
      tallaPantalon: z.number({
        message: "Debe seleccionar una talla de pantalón",
      }),
      tallaZapatos: z.number({
        message: "Debe seleccionar una talla de zapatos",
      }),
    })
    .optional(),
  formacion_academica_familiar: z.object({
    nivel_Academico_id: z.number(),
    carrera_id: z.number().optional(),
    mencion_id: z.number().optional(),
    capacitacion: z.string().optional(),
    institucion: z.string().optional(),
  }),
  orden_hijo: z.number().optional(),
});

export type FamilyEmployeeTypeForm = z.infer<typeof schemaFamilyEmployeeOne>;
