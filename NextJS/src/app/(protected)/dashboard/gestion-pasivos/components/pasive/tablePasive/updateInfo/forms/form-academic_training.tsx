"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  getAcademyLevel,
  getCarrera,
  getMencion,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { AcademyType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal-trabajador/registrar/schemas/schema-academic_training";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import updateInfoEmployee from "../actions/update-info";
import {
  AcademyUpdateUpdateType,
  schemaAcademyUpdate,
} from "../schema/schema-academic_training";
import Loading from "@/app/(protected)/dashboard/gestion-trabajadores/components/loading/loading";
import { useSearchStore } from "@/hooks/use-search-params";

type Props = {
  defaultValues: AcademyType;
  idEmployee: string;
  mutate: (key: string[]) => void;
};
export default function FormUpdateAcademyLevel({
  defaultValues,
  idEmployee,
}: Props) {
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();
  const [mencionId, setMencionId] = useState<string>();
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const form = useForm({
    resolver: zodResolver(schemaAcademyUpdate),
    defaultValues: {
      formacion_academica: {
        nivel_Academico_id: 0,
        capacitacion: undefined,
        carrera_id: 0,
        institucion: undefined,
        mencion_id: 0,
      },
    },
  });

  const { data: academyLevel, isLoading: isLoadingAcademyLevel } = useSWR(
    "academyLevel",
    async () => await getAcademyLevel(),
  );
  const { data: carrera, isLoading: isLoadingCarrera } = useSWR(
    "carrera",
    async () => await getCarrera(),
  );
  const { data: mencion, isLoading: isLoadingMencion } = useSWR(
    mencionId ? ["mencion", mencionId] : null,
    async () => await getMencion(mencionId!),
  );
  const searchParams = useSearchStore((state) => state.searchParams);
  const onSubmitFormity = (values: AcademyUpdateUpdateType) => {
    startTransition(async () => {
      const response = await updateInfoEmployee(values, idEmployee);
      if (response.success) {
        toast.success(response.message);
        mutate(["api/pasivos", searchParams]);
      } else {
        toast.error(response.message);
      }
    });
  };
  const academyLevelId = useWatch({
    control: form.control,
    name: "formacion_academica.nivel_Academico_id",
  });
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Formacion Academica</CardTitle>
        </CardHeader>
        <CardContent>
          <CardAction className="text-gray-500">
            Información Academica
          </CardAction>
          {isPending ? (
            <Loading promiseMessage="Actualizando Información" />
          ) : (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitFormity)}
                  className="space-y-6 grid grid-cols-2 gap-4"
                >
                  <FormField
                    control={form.control}
                    name="formacion_academica.nivel_Academico_id"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nivel Academico</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={` ${isLoadingAcademyLevel ? "Cargando Niveles Academicos" : "Seleccione un Nivel Academico"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academyLevel?.data.map((nivel, i) => (
                              <SelectItem key={i} value={`${nivel.id}`}>
                                {nivel.nivelacademico}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!(academyLevelId == 1 || academyLevelId == 2) && (
                          <FormDescription className="flex flex-row gap-2 justify-end">
                            <Label>Mas Detalles De Formacion Academica</Label>
                            <Switch onCheckedChange={setShowMoreDetails} />
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showMoreDetails && (
                    <>
                      <FormField
                        control={form.control}
                        name="formacion_academica.carrera_id"
                        render={({ field }) => (
                          <FormItem className=" ">
                            <FormLabel>Carrera (Opcional)</FormLabel>
                            <Select
                              onValueChange={(values) => {
                                field.onChange(Number.parseInt(values));
                                setMencionId(values);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full truncate">
                                  <SelectValue
                                    placeholder={`${isLoadingCarrera ? "Cargando Carreras" : "Seleccione una carrera"}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {carrera?.data.map((carrera, i) => (
                                  <SelectItem key={i} value={`${carrera.id}`}>
                                    {carrera.nombre_carrera}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="formacion_academica.mencion_id"
                        render={({ field }) => (
                          <FormItem className=" ">
                            <FormLabel>Mención (Opcional)</FormLabel>
                            <Select
                              onValueChange={(values) => {
                                field.onChange(Number.parseInt(values));
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full truncate">
                                  <SelectValue
                                    placeholder={`${isLoadingMencion ? "Cargando Menciones Academicas " : "Seleccione una mencion academica"}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mencion?.data.map((mencion, i) => (
                                  <SelectItem key={i} value={`${mencion.id}`}>
                                    {mencion.nombre_mencion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="formacion_academica.capacitacion"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacitacion (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Capacitado En..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="formacion_academica.institucion"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institucion (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Universidad Nacional..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <Button className="w-full col-span-2" disabled={isPending}>
                    {" "}
                    {isPending ? "Actualizando Información" : "Actualizar"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
