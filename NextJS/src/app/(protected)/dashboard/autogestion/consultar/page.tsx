"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { z } from "zod";
import { Download, Search, Eraser } from "lucide-react";
import { toast } from "sonner";

import PageLayout from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { consultarCensoEmpleado, exportarCensoExcel, type CensoEmpleadoItem } from "../api/getInfoAutogestion";
import Loading from "../../gestion-trabajadores/components/loading/loading";

const schemaSearch = z.object({
  cedula: z.string().optional(),
});

export default function ConsultarCensoPage() {
  const [searchCedula, setSearchCedula] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(schemaSearch),
    defaultValues: { cedula: "" },
  });

  const { data, isLoading, mutate } = useSWR(
    "censo-consultar",
    () => consultarCensoEmpleado(searchCedula || undefined),
    { revalidateOnFocus: false },
  );

  const empleados: CensoEmpleadoItem[] = data?.data ?? [];

  const onSearch = (values: z.infer<typeof schemaSearch>) => {
    setSearchCedula(values.cedula || "");
    mutate();
  };

  const onExportExcel = () => {
    startTransition(async () => {
      try {
        const blob = await exportarCensoExcel();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `censo_vivienda_${new Date().toISOString().split("T")[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Excel descargado correctamente");
      } catch {
        toast.error("Error al descargar el Excel");
      }
    });
  };

  return (
    <PageLayout
      title="Respuestas del Censo"
      description="Consulta las respuestas del censo de vivienda por trabajador"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSearch)}
          className="flex flex-row items-end gap-2"
        >
          <FormField
            name="cedula"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buscar por Cedula</FormLabel>
                <FormControl>
                  <Input placeholder="buscar cedula..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            Buscar <Search />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              form.reset({ cedula: "" });
              setSearchCedula("");
              mutate();
            }}
          >
            Limpiar <Eraser />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="cursor-pointer ml-auto"
            onClick={onExportExcel}
            disabled={isPending}
          >
            {isPending ? "Generando..." : "Exportar Excel"} <Download />
          </Button>
        </form>
      </Form>

      {isLoading ? (
        <Loading promiseMessage="Cargando respuestas..." />
      ) : (
        <ScrollArea className="h-[70vh] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Cedula</TableHead>
                <TableHead>Nombres</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Carnet Patria</TableHead>
                <TableHead className="w-[80px]">APN</TableHead>
                <TableHead>Preguntas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron respuestas
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.cedula}</TableCell>
                    <TableCell>{emp.nombres}</TableCell>
                    <TableCell>{emp.apellidos}</TableCell>
                    <TableCell>{emp.carnet_patria || "N/A"}</TableCell>
                    <TableCell>
                      {emp.total_apn ? `${emp.total_apn.years}a ${emp.total_apn.months}m` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {emp.preguntas?.map((p) => (
                          <Badge key={p.id} variant="outline" className="text-xs">
                            {p.pregunta.substring(0, 30)}: {p.opcion?.opcion || p.respuesta || "—"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </PageLayout>
  );
}
