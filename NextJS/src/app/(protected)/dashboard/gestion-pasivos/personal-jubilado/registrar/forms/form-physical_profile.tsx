"use client";

import {
  getPantsSize,
  getShirtSize,
  getShoesSize,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import {
  PhysicalProfileType,
  schemaPhysicalProfile,
} from "../schemas/schema-physical_profile";

type Props = {
  onSubmit: (values: PhysicalProfileType) => void;
  defaultValues: PhysicalProfileType;
};
export default function FormPhysical({ onSubmit, defaultValues }: Props) {
  const form = useForm({
    resolver: zodResolver(schemaPhysicalProfile),
    defaultValues,
  });
  const { data: shirtSize, isLoading: isLoadingShirtSize } = useSWR(
    "shirtSize",
    async () => await getShirtSize(),
  );
  const { data: pantsSize, isLoading: isLoadingPantsSize } = useSWR(
    "pantsSize",
    async () => await getPantsSize(),
  );
  const { data: shoesSize, isLoading: isLoadingShoesSize } = useSWR(
    "shoesSize",
    async () => await getShoesSize(),
  );
  const onSubmitFormity = (data: z.infer<typeof schemaPhysicalProfile>) => {
    onSubmit(data);
  };
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Vestimenta</CardTitle>
      </CardHeader>
      <CardContent>
        <CardAction className="text-gray-600">
          Paso 5: Datos De Vestimenta
        </CardAction>
        <Form {...form}>
          <form
            className="grid grid-cols-2 gap-2 space-y-2"
            onSubmit={form.handleSubmit(onSubmitFormity)}
          >
            <FormField
              control={form.control}
              name="perfil_fisico.tallaCamisa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Talla De Camisa</FormLabel>
                  <Select
                    onValueChange={(values) => {
                      field.onChange(Number.parseInt(values));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue
                          placeholder={`${isLoadingShirtSize ? "Cargando Tallas De Camisa" : "Seleccione una Talla De Camisa"}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shirtSize?.data.map((shirt, i) => (
                        <SelectItem key={i} value={`${shirt.id}`}>
                          {shirt.talla}
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
              name="perfil_fisico.tallaPantalon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Talla De Pantalón</FormLabel>
                  <Select
                    onValueChange={(values) => {
                      field.onChange(Number.parseInt(values));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue
                          placeholder={`${isLoadingPantsSize ? "Cargando Tallas De Pantalones " : "Seleccione una Talla De Pantalón"}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pantsSize?.data.map((pants, i) => (
                        <SelectItem key={i} value={`${pants.id}`}>
                          {pants.talla}
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
              name="perfil_fisico.tallaZapatos"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Talla De Zapatos</FormLabel>
                  <Select
                    onValueChange={(values) => {
                      field.onChange(Number.parseInt(values));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue
                          placeholder={` ${isLoadingShoesSize ? "Cargando Tallas de Zapatos" : "Seleccione una Talla de Zapatos"}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shoesSize?.data.map((shoes, i) => (
                        <SelectItem key={i} value={`${shoes.id}`}>
                          {shoes.talla}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full col-span-2">Siguiente</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
