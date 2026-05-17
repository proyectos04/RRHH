import { useForm, useWatch } from "react-hook-form";
import {
  schemaUpdateAcademy,
  TypeSchemaUpdateAcademy,
} from "../schema/schemaAcademyUpdate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import InputForm from "@/components/input-form";
import {
  getAcademyLevel,
  getCarrera,
  getMencion,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import useSWR from "swr";
import { SelectForm } from "@/components/select-form";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import Loading from "../../../../loading/loading";
import updateInfoAction from "../action/updateInfoAction";
import { toast } from "sonner";
import { useSearchStore } from "@/hooks/use-search-params";
interface Props {
  id: number;
  mutate: (key: string[]) => void;
}
export default function UpdateFormAcademy({ id, mutate }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TypeSchemaUpdateAcademy>({
    defaultValues: {
      formacion_academica_familiar: {
        capacitacion: undefined,
        carrera_id: undefined,
        institucion: undefined,
        nivel_Academico_id: undefined,
        mencion_id: undefined,
      },
    },
    resolver: zodResolver(schemaUpdateAcademy),
  });
  const { data: academy, isLoading: isLoadingAcademy } = useSWR(
    "academy",
    async () => await getAcademyLevel(),
  );
  const { data: carrera, isLoading: isLoadingCarrera } = useSWR(
    "carrera",
    async () => await getCarrera(),
  );

  const carreraId = useWatch({
    control: form.control,
    name: "formacion_academica_familiar.carrera_id",
  });
  const { data: menction, isLoading: isLoadingMenction } = useSWR(
    carreraId ? ["academy", carreraId] : null,
    async () => await getMencion(carreraId?.toString() ?? ""),
  );
  const searchParams = useSearchStore((state) => state.searchParams);

  const onSubmit = (values: TypeSchemaUpdateAcademy) => {
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
    <>
      {isPending ? (
        <Loading />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <SelectForm
                Formlabel="Selecciona Un Nivel Academico"
                SelectLabelItem="Selecciona Un Nivel Academico"
                form={form}
                isLoading={isLoadingAcademy}
                options={academy?.data ?? []}
                nameSalect="formacion_academica_familiar.nivel_Academico_id"
                labelKey="nivelacademico"
                placeholder="Selecciona un nivel academico"
                valueKey="id"
              />
              <InputForm
                form={form}
                label="Institución"
                nameInput="formacion_academica_familiar.institucion"
                type="text"
              />
              <SelectForm
                Formlabel="Carrera"
                SelectLabelItem="Seleccione una carrera"
                form={form}
                isLoading={isLoadingCarrera}
                nameSalect="formacion_academica_familiar.carrera_id"
                options={carrera?.data ?? []}
                placeholder="Seleccione una carrera"
                valueKey="id"
                labelKey={"nombre_carrera"}
              />
              <SelectForm
                Formlabel="Seleccione una mención"
                SelectLabelItem="Seleccione una mención"
                form={form}
                isLoading={isLoadingMenction}
                nameSalect="formacion_academica_familiar.mencion_id"
                options={menction?.data ?? []}
                placeholder="Seleccione una mención"
                valueKey="id"
                labelKey={"nombre_mencion"}
              />
              <InputForm
                form={form}
                label="Capacitación"
                nameInput="formacion_academica_familiar.capacitacion"
                type="text"
                className="col-span-2"
              />
              <Button className="col-span-2 cursor-pointer">
                {" "}
                Guardar Información
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
