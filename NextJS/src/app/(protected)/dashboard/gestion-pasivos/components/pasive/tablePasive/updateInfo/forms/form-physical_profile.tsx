"use client";

import {
  getPantsSize,
  getShirtSize,
  getShoesSize,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { PhysicalProfileType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal-trabajador/registrar/schemas/schema-physical_profile";
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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import updateInfoEmployee from "../actions/update-info";
import {
  PhysicalProfileUpdateType,
  schemaPhysicalProfileUpdate,
} from "../schema/schema-physical_profile";
import Loading from "@/app/(protected)/dashboard/gestion-trabajadores/components/loading/loading";
import { useSearchStore } from "@/hooks/use-search-params";

type Props = {
  defaultValues: PhysicalProfileType;
  idEmployee: string;
  mutate: (key: string[]) => void;
};
export default function FormUpdatePhysical({
  defaultValues,
  idEmployee,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const { mutate } = useSWRConfig();
  const form = useForm({
    resolver: zodResolver(schemaPhysicalProfileUpdate),
    defaultValues: {
      perfil_fisico: {
        tallaCamisa: 0,
        tallaPantalon: 0,
        tallaZapatos: 0,
      },
    },
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
  const searchParams = useSearchStore((state) => state.searchParams);

  const onSubmitFormity = (values: PhysicalProfileUpdateType) => {
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
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Vestimenta</CardTitle>
      </CardHeader>
      <CardContent>
        <CardAction className="text-gray-600">Datos De Vestimenta</CardAction>
        {isPending ? (
          <Loading promiseMessage="Actualizando Información" />
        ) : (
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
                        field.onChange(values === "" ? "" : Number(values));
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
                        field.onChange(values === "" ? "" : Number(values));
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
                        field.onChange(values === "" ? "" : Number(values));
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
              <Button className="w-full col-span-2" disabled={isPending}>
                {isPending ? "Actualizando Información" : "Actualizar"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
