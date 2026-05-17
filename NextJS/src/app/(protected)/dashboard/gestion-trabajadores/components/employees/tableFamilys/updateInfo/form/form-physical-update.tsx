import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  SchemaUpdatePhysical,
  schemaUpdatePhysical,
} from "../schema/schemaPhysicalUpdate";
import { SelectForm } from "@/components/select-form";
import useSWR from "swr";
import {
  getPantsSize,
  getShirtSize,
  getShoesSize,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTransition } from "react";
import updateInfoAction from "../action/updateInfoAction";
import { toast } from "sonner";
import { useSearchStore } from "@/hooks/use-search-params";
interface Props {
  id: number;
  mutate: (key: string[]) => void;
}
export default function UpdateFormPhysical({ id, mutate }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SchemaUpdatePhysical>({
    resolver: zodResolver(schemaUpdatePhysical),
    defaultValues: {
      perfil_fisico_familiar: {
        tallaCamisa: undefined,
        tallaPantalon: undefined,
        tallaZapatos: undefined,
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

  const onSubmit = (values: SchemaUpdatePhysical) => {
    startTransition(async () => {
      const response = await updateInfoAction({ idFamily: id, values });
      if (response.success) {
        form.reset();
        toast.success(response.message);
        mutate(["api/family", searchParams]);
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <SelectForm
            Formlabel="Talla de Camisa"
            SelectLabelItem="Seleccione una talla de camisa"
            form={form}
            isLoading={isLoadingShirtSize}
            labelKey={"talla"}
            nameSalect="perfil_fisico_familiar.tallaCamisa"
            valueKey="id"
            placeholder="Seleccione una talla de camisa"
            options={shirtSize?.data ?? []}
          />
          <SelectForm
            Formlabel="Talla de pantalones"
            SelectLabelItem="Seleccione una talla de pantalones"
            form={form}
            options={pantsSize?.data ?? []}
            isLoading={isLoadingPantsSize}
            labelKey="talla"
            nameSalect="perfil_fisico_familiar.tallaPantalon"
            valueKey="id"
            placeholder="Seleccione una talla de pantalones"
          />
          <SelectForm
            options={shoesSize?.data ?? []}
            SelectLabelItem="Seleccione una talla de zapatos"
            form={form}
            isLoading={isLoadingShoesSize}
            labelKey="talla"
            nameSalect="perfil_fisico_familiar.tallaZapatos"
            placeholder="Seleccione una talla de zapatos"
            valueKey="id"
            Formlabel="Talla de zapatos"
            classNameItem="col-span-2"
          />
          <Button type="submit" className="col-span-2 cursor-pointer">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
