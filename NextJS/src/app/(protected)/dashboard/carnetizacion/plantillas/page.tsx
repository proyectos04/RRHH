"use client";
import PageLayout from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ImagePlus,
  Loader2,
  Palette,
  Upload,
  CheckCircle2,
  XCircle,
  Star,
  FileImage,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Plantilla {
  id: number;
  nombre: string;
  imagen_url: string | null;
  activo: boolean;
  creado: string;
}

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nombre, setNombre] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const djangoUrl =
    process.env.NEXT_PUBLIC_DJANGO_API_URL?.replace("/api/", "") ||
    "http://localhost:8000";

  const cargarPlantillas = async () => {
    try {
      const res = await fetch(`${djangoUrl}/carnetizacion/api/plantillas/`);
      const data = await res.json();
      setPlantillas(data);
    } catch {
      toast.error("Error al cargar plantillas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, [djangoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const subirPlantilla = async () => {
    if (!nombre.trim()) {
      toast.error("Debe ingresar un nombre");
      return;
    }
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Debe seleccionar una imagen");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      formData.append("imagen", file);

      const res = await fetch(`${djangoUrl}/carnetizacion/api/plantillas/crear/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir");

      toast.success("Plantilla subida exitosamente");
      setNombre("");
      setPreview(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await cargarPlantillas();
    } catch {
      toast.error("Error al subir la plantilla");
    } finally {
      setUploading(false);
    }
  };

  const activarPlantilla = async (id: number) => {
    try {
      const res = await fetch(
        `${djangoUrl}/carnetizacion/api/plantillas/${id}/activar/`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error();
      toast.success("Plantilla activada");
      await cargarPlantillas();
    } catch {
      toast.error("Error al activar plantilla");
    }
  };

  if (loading) {
    return (
      <PageLayout title="Plantillas">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Plantillas de Carnet"
      description="Administra las plantillas de fondo para los carnets"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Formulario de carga */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImagePlus className="h-5 w-5" />
              Subir Nueva Plantilla
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Fondo CONATEL 2026"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Imagen (JPG/PNG, máx 5MB)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileImage className="h-4 w-4 mr-1" />
                  Seleccionar Imagen
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {fileName}
                  </span>
                )}
              </div>
            </div>
            {preview && (
              <div className="border rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full object-cover max-h-40"
                />
              </div>
            )}
            <Button
              className="w-full"
              onClick={subirPlantilla}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Subiendo..." : "Subir Plantilla"}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de plantillas */}
        <div className="lg:col-span-2 space-y-3">
          {plantillas.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="text-center py-12">
                <Palette className="h-14 w-14 mx-auto text-gray-300" />
                <p className="text-lg font-medium text-gray-500 mt-4">
                  Sin plantillas
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube la primera plantilla usando el formulario
                </p>
              </CardContent>
            </Card>
          ) : (
            plantillas.map((p) => (
              <Card
                key={p.id}
                className={`shadow-sm transition-all ${
                  p.activo ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-md overflow-hidden border bg-gray-50 flex-shrink-0">
                      {p.imagen_url ? (
                        <img
                          src={`${djangoUrl}${p.imagen_url}`}
                          alt={p.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <Palette className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{p.nombre}</h3>
                        {p.activo ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 flex-shrink-0">
                            <Star className="h-3 w-3 mr-1" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex-shrink-0">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactiva
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subida el {new Date(p.creado).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {!p.activo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activarPlantilla(p.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Activar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
