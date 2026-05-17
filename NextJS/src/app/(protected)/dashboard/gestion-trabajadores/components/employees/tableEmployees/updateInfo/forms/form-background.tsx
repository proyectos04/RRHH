"use client";

import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  CalendarIcon,
  ChevronDownIcon,
  Cross,
  Trash,
  X,
} from "lucide-react";

import {
  BackgroundType,
  schemaBackground,
} from "@/app/(protected)/dashboard/gestion-trabajadores/personal-trabajador/registrar/schemas/schema-background";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatInTimeZone } from "date-fns-tz";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { z } from "zod";
import Loading from "../../../../loading/loading";
import updateInfoEmployee from "../actions/update-info";
import { schemaBackgroundUpdate } from "../schema/schema-background";
import { useSearchStore } from "@/hooks/use-search-params";
import { Badge } from "@/components/ui/badge";
type Props = {
  defaultValues: BackgroundType;
  idEmployee: string;
  mutate: (key: string[]) => void;
};
export default function FormUpdateBackground({
  defaultValues,
  mutate,
  idEmployee,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(schemaBackgroundUpdate),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    name: "antecedentes",
    control: form.control,
  });
  const searchParams = useSearchStore((state) => state.searchParams);
  const onSubmitFormity = (values: z.infer<typeof schemaBackground>) => {
    startTransition(async () => {
      const response = await updateInfoEmployee(values, idEmployee);
      if (response.success) {
        toast.success(response.message);
        mutate(["api/empleados", searchParams]);
      } else {
        toast.error(response.message);
      }
    });
  };
  const isError = form.formState.isValid;

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Antecedentes En La Administracion Publica</CardTitle>
      </CardHeader>

      <CardContent>
        <CardAction className="text-gray-600">Datos Laborales</CardAction>
      </CardContent>

      <CardContent>
        {isPending ? (
          <Loading promiseMessage="Actualizando Información" />
        ) : (
          <Form {...form}>
            <form
              className="flex flex-row flex-wrap gap-2"
              onSubmit={form.handleSubmit(onSubmitFormity)}
            >
              <FormField
                control={form.control}
                name="fechaingresoorganismo"
                render={({ field }) => (
                  <FormItem className="flex flex-col  grow shrink basis-40">
                    <FormLabel> Fecha de Ingreso al Organismo *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className="font-light">
                            {field.value ? (
                              formatInTimeZone(field.value, "UTC", "dd/MM/yyy")
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          mode="single"
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center  gap-2  mr-4 items-center ">
                <div className="flex flex-col items-center justify-center">
                  <Label htmlFor="clean">Limpiar</Label>
                  <Button
                    id="clean"
                    variant={"default"}
                    type="button"
                    className="bg-red-500 border-2 border-red-600/25 hover:bg-red-600/90 cursor-pointer"
                    onClick={() => {
                      remove(
                        fields
                          .filter((field, index) => index !== 0)
                          .map((field, index) => index + 1),
                      );
                      form.reset({
                        antecedentes: [
                          {
                            fecha_ingreso: undefined,
                            fecha_egreso: undefined,
                            institucion: undefined,
                          },
                        ],
                      } as BackgroundType);
                    }}
                  >
                    <Trash />
                  </Button>
                </div>
                {isError && (
                  <div className="flex flex-col items-center justify-center">
                    <Label htmlFor="add">Agregar</Label>
                    <Button
                      id="add"
                      variant={"default"}
                      type="button"
                      className="cursor-pointer"
                      onClick={() => {
                        append({
                          fecha_ingreso: undefined,
                          fecha_egreso: undefined,
                          institucion: undefined,
                        });
                      }}
                    >
                      <Cross />
                    </Button>
                  </div>
                )}
              </div>
              <ScrollArea className="h-60   rounded-md w-full border p-2">
                <h1 className="text-gray-600">
                  Opcional si no posee antecedentes
                </h1>
                {fields.map((field, index) => (
                  <>
                    <div
                      key={field.id}
                      className="grid grid-cols-2 gap-5 space-y-5 place-items-center w-full"
                    >
                      <FormField
                        control={form.control}
                        name={`antecedentes.${index}.fecha_ingreso`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {" "}
                              {index + 1}. Fecha Inicio <ArrowBigDownDash />
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    id="date-start"
                                    className="w-48 justify-between font-normal"
                                  >
                                    {field.value ? (
                                      formatInTimeZone(
                                        field.value,
                                        "UTC",
                                        "dd/MM/yyy",
                                      )
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <ChevronDownIcon />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  captionLayout="dropdown"
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1930-01-01")
                                  }
                                  onSelect={(date) => {
                                    field.onChange(date);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`antecedentes.${index}.fecha_egreso`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {index + 1}. Fecha Culminacion <ArrowBigUpDash />
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    id="date-start"
                                    className="w-48 justify-between font-normal"
                                  >
                                    {field.value ? (
                                      formatInTimeZone(
                                        field.value,
                                        "UTC",
                                        "dd/MM/yyy",
                                      )
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <ChevronDownIcon />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  captionLayout="dropdown"
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1930-01-01")
                                  }
                                  onSelect={(date) => {
                                    field.onChange(date);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`antecedentes.${index}.institucion`}
                        render={({ field }) => (
                          <FormItem
                            className={` ${index > 0 ? "" : "col-span-2 w-full"}`}
                          >
                            <FormLabel>Nombre Del Ente/Institucion</FormLabel>
                            <FormControl>
                              <Input placeholder="MIJ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant={"destructive"}
                        className={`${index === 0 ? "invisible" : ""} cursor-pointer`}
                        onClick={() => remove(index)}
                      >
                        Eliminar Fecha {index}
                        <X />
                      </Button>
                    </div>
                  </>
                ))}
              </ScrollArea>
              {!isError && (
                <Badge
                  className="animate-pulse text-lg font-bold text-white w-full flex justify-center items-center text-center h-auto py-2 whitespace-normal"
                  variant={"destructive"}
                >
                  {" "}
                  Por favor, corrija los campos marcados o complete la
                  información pendiente antes de agregar un nuevo antecedente.
                </Badge>
              )}
              <Button
                className="mt-4 w-full cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Actualizando Información" : "Actualizar"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
