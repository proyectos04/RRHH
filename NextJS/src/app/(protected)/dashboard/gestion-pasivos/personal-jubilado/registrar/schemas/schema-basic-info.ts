import { z } from "zod";

export const schemaBasicInfo = z.object({
  usuario_id: z.number(),
  cedulaidentidad: z
    .string({
      message: "Debe Ingresar Numeros",
      required_error: "Cédula De Identidad Es Requerido",
    })
    .min(7, { message: "Debe Ingresar Al Menos 7 Digitos" })
    .max(12, { message: "Debe Maximo 12 Digitos" }),
  nombres: z
    .string({
      message: "Debe Ingresar Letras",
      required_error: "El Nombre Completo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Letras" })
    .max(30, {
      message: "Debe Ingresar Maximo 30 Letras",
    }),
  apellidos: z
    .string({
      message: "Debe Ingresar Letras",
      required_error: "El Apellido Completo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Letras" })
    .max(30, {
      message: "Debe Ingresar Maximo 30 Letras",
    }),
  file: z
    .instanceof(File)
    .nullable()
    .refine((file) => file !== null, {
      message: "Debe Ingresar Una Imagen De Perfil",
    })
    .refine((file) => file === null || file.size <= 5000000, {
      message: "El Tamaño Maximo De La Imagen Es 5MB",
    }),

  fecha_nacimiento: z
    .date({
      message: "Debe Ingresar Una Fecha Requerida",
      required_error: "La Fecha Es Requerida",
    })
    .refine((date) => date <= new Date(), {
      message: "La Fecha De Nacimiento No Puede Ser En El Futuro",
    })
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 16;
      },
      {
        message: "La Edad Mínima Es De 16 Años",
      },
    ),

  n_contrato: z
    .string({
      message: "Debe Ingresar Información Valida",
      required_error: "Este Campo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Caracteres" }),
  sexoid: z.coerce
    .number({
      message: "Debe Ingresar Un Sexo Valido",
      required_error: "El Sexo Es Requerido",
    })
    .refine((val) => !(val === 0), {
      message: "Debe Seleccionar Un Sexo",
    }),
  estadoCivil: z
    .number({
      errorMap: () => ({ message: "Debe Seleccionar Un Estado Civil" }),
    })
    .refine((val) => !(val == 0), {
      message: "Debe Seleccionar Un Esttado Civil",
    }),
  correo: z.string().optional(),
  telefono_habitacion: z.string().optional(),
  telefono_movil: z.string().optional(),
});
export type BasicInfoType = z.infer<typeof schemaBasicInfo>;
