"use client";

import {
  getCodeListSearchFree,
  getCoordination,
  getDependency,
  getDirectionGeneralById,
  getDirectionLine,
  getEmployeeInfo,
  getNomina,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { AsignCode } from "@/app/(protected)/dashboard/gestion-trabajadores/movimientos/asignar-codigo/actions/asign-code";
import { schemaAsignCode } from "@/app/(protected)/dashboard/gestion-trabajadores/movimientos/asignar-codigo/schema/schema-asign-code";
import { EmployeeInfo } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eraser, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import z from "zod";
import { Button } from "../../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Switch } from "../../../../../../components/ui/switch";
import Error from "../error/error";
import Loading from "../loading/loading";
export function AsigCode() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );

  const [selectedCodeId, setSelectedCodeId] = useState<number>();
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();
  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();
  const [employee, setEmployee] = useState<EmployeeInfo | []>();
  const [isPending, startTransition] = useTransition();
  const [dependencyId, setDependencyId] = useState<number>(0);

  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR(
      dependencyId ? ["directionGeneral", dependencyId] : null,
      async () => await getDirectionGeneralById(dependencyId),
    );
  const { data: dependency, isLoading: isLoadingDependency } = useSWR(
    "dependency",
    async () => await getDependency(),
  );
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    selecteIdDirectionGeneral
      ? ["directionLine", selecteIdDirectionGeneral]
      : "",
    async () => await getDirectionLine(selecteIdDirectionGeneral!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    selecteIdDirectionLine ? ["coordination", selecteIdDirectionLine] : null,
    async () => await getCoordination(selecteIdDirectionLine!),
  );
  const [searchParams, setSearchParams] = useState<string>();
  const { data: codeList, isLoading: isLoadingSearchCode } = useSWR(
    searchParams,
    async () => await getCodeListSearchFree({ searchParams }),
  );
  const { data: nomina, isLoading: isLoadingNomina } = useSWR(
    "nominaGeneral",
    async () => await getNomina(),
  );

  const formAsig = useForm({
    resolver: zodResolver(schemaAsignCode),
    defaultValues: {
      code: 0,
      employee: "",
      encargaduria: false,
    },
  });

  const onSubmit = (data: z.infer<typeof schemaAsignCode>) => {
    startTransition(async () => {
      const response = await AsignCode(data);
      if (response.success) {
        toast.success(response.message);
        setSearchEmployee("");
      } else {
        toast.error(response.message);
      }
    });
  };
  const schemaSearchEmployee = z.object({
    searchEmployeeForm: z.string(),
  });
  const handleSearch = async (values: z.infer<typeof schemaSearchEmployee>) => {
    if (!values.searchEmployeeForm) return;
    const response = await getEmployeeInfo(values.searchEmployeeForm);
    if (response.data) {
      setEmployee(response.data);
      formAsig.setValue("employee", response.data.cedulaidentidad, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  const formSearch = useForm({
    defaultValues: {
      searchEmployeeForm: "",
    },
    resolver: zodResolver(schemaSearchEmployee),
  });
  const schemaSearch = z.object({
    tipo_nomina: z.coerce.number().optional(),
    codigo: z.string().optional(),
    dependencia_id: z.coerce.number().optional(),
    direccion_general_id: z.coerce.number().optional(),
    direccion_linea_id: z.coerce.number().optional(),
    coordinacion_id: z.coerce.number().optional(),
  });
  const onSearch = (values: z.infer<typeof schemaSearch>) => {
    const filteredEntries = Object.entries(values).filter(
      ([_, v]) => v !== "" && v !== 0 && v !== undefined && v !== null,
    );
    const params = new URLSearchParams(filteredEntries as unknown as string);
    setSearchParams(params.toString());
  };
  const form = useForm({
    defaultValues: {
      codigo: "",
      tipo_nomina: undefined,
      dependencia_id: 0,
      direccion_general_id: 0,
      direccion_linea_id: 0,
      coordinacion_id: 0,
    },
    resolver: zodResolver(schemaSearch),
  });
  const cleanFields = () => {
    form.reset({
      codigo: "",
      tipo_nomina: undefined,
      coordinacion_id: undefined,
      dependencia_id: undefined,
      direccion_general_id: undefined,
      direccion_linea_id: undefined,
    });
  };
  return (
    <>
      {isPending ? (
        <Loading promiseMessage="Asigando Cargo" />
      ) : (
        <Card>
          <CardContent className="space-y-5">
            <Form {...formSearch}>
              <form
                className="flex flex-row justify-between  gap-2"
                onSubmit={formSearch.handleSubmit(handleSearch)}
              >
                <FormField
                  name="searchEmployeeForm"
                  control={formSearch.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      <FormLabel>Buscar Trabajador</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000000"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className="self-baseline-last cursor-pointer">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </Form>
            {employee && (
              <div
                className={` ${
                  !Array.isArray(employee) &&
                  "border-2 border-blue-400/45 bg-blue-200/40"
                }  rounded-sm p-2 `}
              >
                {!Array.isArray(employee) && (
                  <div className="flex flex-row gap-2">
                    <p>Nombres: {employee.nombres}</p>
                    <p>Cédula: {employee.cedulaidentidad}</p>
                  </div>
                )}
              </div>
            )}
            {Array.isArray(employee) && (
              <Error errorMessage="Cédula Invalida" />
            )}
            {employee && !Array.isArray(employee) && (
              <div className="space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSearch)}>
                    <div className="flex flex-row items-center gap-2 w-full flex-1">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <FormField
                          name="codigo"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buscar Código </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="buscar codigo..."
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tipo_nomina"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Nomina</FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={`${
                                        isLoadingNomina
                                          ? "Cargando Nominas"
                                          : "Seleccione un Tipo de Nomina"
                                      }`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Ninguno</SelectItem>
                                  {nomina?.data.map((nomina, i) => (
                                    <SelectItem key={i} value={`${nomina.id}`}>
                                      {nomina.nomina}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />{" "}
                        <FormField
                          control={form.control}
                          name="dependencia_id"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Nivel</FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                  setDependencyId(Number.parseInt(values));
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={`${
                                        isLoadingDependency
                                          ? "Cargando Niveles"
                                          : "Seleccione un Nivel"
                                      }`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {dependency?.data.map((dependencia, i) => (
                                    <SelectItem
                                      key={i}
                                      value={`${dependencia.id}`}
                                    >
                                      {dependencia.dependencia}
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
                          name="direccion_general_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Dirección / Gerencia / Oficina
                              </FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                  setSelecteIdDirectionGeneral(values);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={`${
                                        isLoadingDirectionGeneral
                                          ? "Cargando Direcciones"
                                          : "Seleccione una Dirección"
                                      }`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {directionGeneral?.data.map((general, i) => (
                                    <SelectItem key={i} value={`${general.id}`}>
                                      {general.Codigo}-
                                      {general.direccion_general}
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
                          name="direccion_linea_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>División / Coordinación</FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                  setSelecteIdDirectionLine(values);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={`${
                                        isLoadingDirectionLine
                                          ? "Cargando División / Coordinación "
                                          : "Seleccione una División / Coordinación "
                                      }`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {directionLine?.data.map((line, i) => (
                                    <SelectItem key={i} value={`${line.id}`}>
                                      {line.Codigo}-{line.direccion_linea}
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
                          name="coordinacion_id"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Coordinación</FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={`${
                                        isLoadingCoordination
                                          ? "Cargando Coordinaciones"
                                          : "Seleccione una Coordinación"
                                      }`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {coordination?.data.map((coord, i) => (
                                    <SelectItem key={i} value={`${coord.id}`}>
                                      {coord.Codigo}-{coord.coordinacion}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button className="cursor-pointer self-baseline-last">
                          Buscar <Search />
                        </Button>
                        <Button
                          variant={"outline"}
                          className="cursor-pointer self-baseline-last"
                          type="button"
                          onClick={cleanFields}
                        >
                          Limpiar <Eraser />
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            {employee && !Array.isArray(employee) && (
              <div>
                <Form {...formAsig}>
                  <form onSubmit={formAsig.handleSubmit(onSubmit)}>
                    {codeList?.data.length! > 0 && (
                      <>
                        <FormField
                          control={formAsig.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Listado De Codigos Disponibles
                              </FormLabel>
                              <Select
                                onValueChange={(values) => {
                                  field.onChange(Number.parseInt(values));
                                  setSelectedCodeId(Number.parseInt(values));
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full truncate">
                                    <SelectValue
                                      placeholder={"Seleccione Un Codigo"}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {codeList?.data.map((codes, i) => (
                                    <SelectItem key={i} value={`${codes.id}`}>
                                      {codes.codigo} -{" "}
                                      {codes.denominacioncargoespecifico.cargo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {codeList?.data.find(
                          (v) => v.id === selectedCodeId,
                        ) && (
                          <div className="rounded-sm border-2 border-b-emerald-400-400/45 bg-emerald-200/40 p-2 mt-4">
                            <p>
                              D / G / O:{" "}
                              {codeList?.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.DireccionGeneral?.direccion_general ?? "N/A"}
                            </p>
                            <p>
                              {" "}
                              División / Coordinación:{" "}
                              {codeList?.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.DireccionLinea?.direccion_linea ?? "N/A"}
                            </p>
                            <p>
                              {" "}
                              Coordinación:{" "}
                              {codeList?.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.Coordinacion?.coordinacion
                                ? codeList?.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.Coordinacion?.coordinacion
                                : "N/A"}
                            </p>
                            <p>
                              Organismo Adscrito:{" "}
                              {codeList?.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.OrganismoAdscrito
                                ? codeList?.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.OrganismoAdscrito?.Organismoadscrito
                                : "N/A"}
                            </p>
                            <p>
                              Grado:{" "}
                              {codeList?.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.grado?.grado
                                ? codeList?.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.grado?.grado
                                : "N/A"}
                            </p>
                            <p>
                              Cargo:{" "}
                              {
                                codeList?.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.denominacioncargo.cargo
                              }
                            </p>
                            <p>
                              Cargo Específico:{" "}
                              {
                                codeList?.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.denominacioncargoespecifico.cargo
                              }
                            </p>
                            <p>
                              Estatus:{" "}
                              {
                                codeList?.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.estatusid.estatus
                              }
                            </p>
                            <p>
                              Tipo De Nomina:{" "}
                              {
                                codeList?.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.tiponomina.nomina
                              }
                            </p>
                          </div>
                        )}

                        <FormField
                          control={formAsig.control}
                          name="encargaduria"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                              <div className="space-y-0.5">
                                <FormLabel>Encargaduría</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          className="w-full mt-2 cursor-pointer"
                          disabled={isPending}
                        >
                          {isPending ? "Asignando Código" : "Asignar Código"}
                        </Button>
                      </>
                    )}

                    {codeList?.data.length! < 1 && (
                      <Error errorMessage="No Hay Codigos Vacantes Disponibles" />
                    )}
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
