"use client";
import PageLayout from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Download,
  IdCard,
  Loader2,
  Lock,
  Printer,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface EmployeeInfo {
  id: number;
  cedula: string;
  nombre_completo: string;
  cargo: string;
  departamento: string;
  codigo: string;
  total_solicitudes: number;
}

interface MotivoOption {
  id: number;
  nombre: string;
}

function GenerarCarnetContent() {
  const searchParams = useSearchParams();
  const cedula = searchParams.get("cedula") || "";

  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Campos editables
  const [nombre, setNombre] = useState("");
  const [motivoId, setMotivoId] = useState<number>(0);
  const [motivos, setMotivos] = useState<MotivoOption[]>([]);
  const [vistaPrevia, setVistaPrevia] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const djangoUrl =
    process.env.NEXT_PUBLIC_DJANGO_API_URL?.replace("/api/", "") ||
    "http://localhost:8000";

  useEffect(() => {
    if (!cedula) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar motivos
        const motivosRes = await fetch(
          `${djangoUrl}/carnetizacion/api/motivos/`,
        );
        const motivosData = await motivosRes.json();
        setMotivos(motivosData);
        if (motivosData.length > 0) setMotivoId(motivosData[0].id);

        // Buscar empleado
        const empRes = await fetch(
          `${djangoUrl}/carnetizacion/api/buscar/?q=${cedula}`,
        );
        const empData = await empRes.json();
        const emp = empData.find(
          (e: EmployeeInfo) => e.cedula === cedula,
        );

        if (emp) {
          setEmployee(emp);
          setNombre(emp.nombre_completo);
          // Vista previa inicial con datos directos del empleado
          await fetch(
            `${djangoUrl}/carnetizacion/actualizar-vista-previa/${emp.cedula}/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre: emp.nombre_completo,
                cedula: emp.cedula,
              }),
            },
          )
            .then((r) => r.json())
            .then((data) => {
              if (data.success) setVistaPrevia(data.vista_previa);
            })
            .catch(() => {});
        }
      } catch {
        toast.error("Error al cargar datos del empleado");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cedula, djangoUrl]);

  const actualizarVistaPrevia = async (ced?: string) => {
    try {
      const res = await fetch(
        `${djangoUrl}/carnetizacion/actualizar-vista-previa/${ced || cedula}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            cedula: ced || cedula,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setVistaPrevia(data.vista_previa);
      }
    } catch {
      // Vista previa no crítica
    }
  };

  const subirFoto = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("foto", file);
      formData.append("nombre", nombre);
      formData.append("cedula", cedula);

      const res = await fetch(
        `${djangoUrl}/carnetizacion/subir-foto/${cedula}/`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (data.success) {
        setVistaPrevia(data.vista_previa);
        toast.success("Foto actualizada correctamente");
      } else {
        toast.error(data.error || "Error al subir foto");
      }
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const generarCarnet = async () => {
    setGenerating(true);
    try {
      // 1. Registrar solicitud
      await fetch(
        `${djangoUrl}/carnetizacion/registrar-solicitud/${cedula}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motivo_id: motivoId, observaciones: "" }),
        },
      );

      // 2. Generar PDF
      const res = await fetch(
        `${djangoUrl}/carnetizacion/generar/${cedula}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            motivo_id: motivoId,
            observaciones: "",
            datos_editados: {
              nombre,
              cedula,
            },
          }),
        },
      );

      if (!res.ok) throw new Error("Error al generar");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carnet_${cedula}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Carnet generado y descargado exitosamente");

      // Actualizar contador
      if (employee) {
        setEmployee({
          ...employee,
          total_solicitudes: employee.total_solicitudes + 1,
        });
      }
    } catch {
      toast.error("Error al generar el carnet");
    } finally {
      setGenerating(false);
    }
  };

  if (!cedula) {
    return (
      <PageLayout
        title="Generar Carnet"
        description="Seleccione un trabajador desde la búsqueda"
      >
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="text-center py-12">
            <IdCard className="h-16 w-16 mx-auto text-gray-300" />
            <p className="text-muted-foreground mt-4">
              No se ha seleccionado un trabajador.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                (window.location.href = "/dashboard/carnetizacion/buscar")
              }
            >
              Ir a Búsqueda
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Generar Carnet">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Cargando datos del empleado...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Generar Carnet"
      description={`Procesando carnet para: ${employee?.nombre_completo || cedula}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Panel izquierdo: Datos editables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Datos del Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cédula (readonly) */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> Cédula (no modificable)
              </label>
              <Input value={cedula} disabled className="mt-1 bg-gray-100" />
            </div>

            {/* Nombre (editable) */}
            <div>
              <label className="text-sm font-medium">Nombre completo</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={() => actualizarVistaPrevia()}
                className="mt-1"
              />
            </div>

            {/* Código (readonly) */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> Código
              </label>
              <Input value={employee?.codigo || ""} disabled className="mt-1 bg-gray-100" />
            </div>

            {/* Cargo (readonly) */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> Cargo
              </label>
              <Input value={employee?.cargo || ""} disabled className="mt-1 bg-gray-100" />
            </div>

            {/* Dirección General (readonly) */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> Dirección General
              </label>
              <Input value={employee?.departamento || ""} disabled className="mt-1 bg-gray-100" />
            </div>

            {/* Info */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                <Printer className="h-3 w-3 mr-1" />
                {employee?.total_solicitudes || 0} carnets emitidos
              </Badge>
            </div>

            <hr />

            {/* Motivo */}
            <div>
              <label className="text-sm font-medium">Motivo</label>
              <Select
                value={String(motivoId)}
                onValueChange={(val) => setMotivoId(Number(val))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Foto */}
            <div>
              <label className="text-sm font-medium">Foto</label>
              <div className="flex gap-2 mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirFoto(file);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  Subir Foto
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-1" />
                  Tomar Foto
                </Button>
              </div>
            </div>

            {/* Botón generar */}
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={generarCarnet}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {generating ? "Generando..." : "Generar Carnet"}
            </Button>
          </CardContent>
        </Card>

        {/* Panel derecho: Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Carnet</CardTitle>
          </CardHeader>
          <CardContent>
            {vistaPrevia ? (
              <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: vistaPrevia }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <IdCard className="h-20 w-20" />
                <p className="mt-4">La vista previa se cargará aquí</p>
              </div>
            )}
              <p className="text-sm text-muted-foreground text-center mt-4">
                Solo el nombre es editable. Cédula, código, cargo y dirección
                general se cargan automáticamente.
              </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default function GenerarCarnetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <GenerarCarnetContent />
    </Suspense>
  );
}
