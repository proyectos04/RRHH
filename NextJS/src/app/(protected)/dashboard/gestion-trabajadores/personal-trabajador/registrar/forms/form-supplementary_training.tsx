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
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  SupplementaryTrainingType,
  schemaSupplementaryTraining,
} from "../schemas/schema-supplementary_training";
import { Badge } from "@/components/ui/badge";

type Props = {
  onSubmit: (values: SupplementaryTrainingType) => void;
  defaultValues: SupplementaryTrainingType;
};
export default function FormSupplementaryTraining({
  onSubmit,
  defaultValues,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schemaSupplementaryTraining),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    name: "formacion_complementaria",
    control: form.control,
  });
  const onSubmitFormity = (
    data: z.infer<typeof schemaSupplementaryTraining>,
  ) => {
    onSubmit(data);
  };
  const isError = form.formState.isValid;
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Formación Complementaria</CardTitle>
      </CardHeader>

      <CardContent>
        <CardAction className="text-gray-600">
          Paso 3: Datos Laborales
        </CardAction>
      </CardContent>

      <CardContent className="">
        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(onSubmitFormity)}
          >
            <div className="flex justify-center gap-2 mr-4 items-center ">
              <div className="flex flex-col items-center justify-center">
                <Label htmlFor="clean">Limpiar</Label>
                <Button
                  id="clean"
                  variant={"destructive"}
                  type="button"
                  className=" cursor-pointer"
                  onClick={() => {
                    remove(
                      fields
                        .filter((field, index) => index !== 0)
                        .map((field, index) => index + 1),
                    );
                    form.reset({
                      formacion_complementaria: [
                        {
                          fecha_inicio: undefined,
                          fecha_fin: undefined,
                          institucion: undefined,
                          capacitacion: undefined,
                        },
                      ],
                    } as SupplementaryTrainingType);
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
                        fecha_inicio: undefined,
                        fecha_fin: undefined,
                        institucion: undefined,
                        capacitacion: undefined,
                      });
                    }}
                  >
                    <Cross />
                  </Button>
                </div>
              )}
            </div>
            <ScrollArea className="h-60 rounded-md w-full border p-2">
              <h1 className="text-gray-600">
                Opcional si no posee formación complementaria
              </h1>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-row gap-5 space-y-5 items-center justify-around w-full"
                >
                    <FormField
                      control={form.control}
                      name={`formacion_complementaria.${index}.fecha_inicio`}
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
                      name={`formacion_complementaria.${index}.fecha_fin`}
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
                      name={`formacion_complementaria.${index}.institucion`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre De La Institución</FormLabel>
                          <FormControl>
                            <Input placeholder="MIJ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`formacion_complementaria.${index}.capacitacion`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacitación</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del curso" {...field} />
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
                      <X />
                    </Button>
                  </div>
              ))}
            </ScrollArea>
            {!isError && (
              <Badge
                className="animate-pulse text-lg font-bold text-white w-full flex justify-center items-center text-center h-auto py-2 whitespace-normal"
                variant={"destructive"}
              >
                {" "}
                Por favor, corrija los campos marcados o complete la información
                pendiente antes de agregar una nueva formación complementaria.
              </Badge>
            )}
            <Button className="mt-4 w-full cursor-pointer">Siguiente</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
