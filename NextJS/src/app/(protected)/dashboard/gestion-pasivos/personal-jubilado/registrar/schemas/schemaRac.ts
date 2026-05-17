import z from "zod";
import { formatInTimeZone } from "date-fns-tz";
export const patologiaCronica = z.object({
  value: z.string(),
});
export const schemaRac = z.object({
  cedulaidentidad: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  fecha_nacimiento: z.date(),
  file: z.instanceof(File).nullable(),
  fechaingresoorganismo: z.date(),
  fechaingresoapn: z.date(),
  n_contrato: z.string(),
  vivienda: z.boolean().default(false),
  direccionExacta: z.string(),
  sexoid: z.number(),
  discapacidad: z.number().optional(),
  estadoCivil: z.number().optional(),
  tallaCamisa: z.number().optional(),
  tallaPantalon: z.number().optional(),
  tallaZapatos: z.number().optional(),
  nivelAcademico: z.number(),
  grupoSanguineo: z.number().optional(),
  estadoid: z.number(),
  municipioid: z.number(),
  parroquiaid: z.number(),
  patologiaCronica: z
    .array(patologiaCronica)
    .transform((v) => v.map((v) => Number.parseInt(v.value)))
    .default([]),
});

export const schemaEmployeeEdit = z.object({
  nombres: z.string(),
  apellidos: z.string(),
  sexoid: z.number(),
  estadoid: z.number(),
  municipioid: z.number(),
  nivelAcademico: z.number(),
  parroquiaid: z.number(),
  direccionExacta: z.string(),
  fecha_nacimiento: z
    .date()
    .or(z.string())
    .transform((v) => String(formatInTimeZone(v,"UTC", "dd/MM/yyyy"))),
});
