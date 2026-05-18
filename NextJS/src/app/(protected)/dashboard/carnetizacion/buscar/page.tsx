"use client";
import PageLayout from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IdCard,
  Search,
  Loader2,
  User,
  CheckCircle2,
  XCircle,
  Printer,
  Hash,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EmployeeCarnet {
  id: number;
  cedula: string;
  nombre_completo: string;
  cargo: string;
  departamento: string;
  codigo: string;
  correo: string;
  telefono: string;
  total_solicitudes: number;
  tiene_carnet: boolean;
}

export default function BuscarPersonalPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmployeeCarnet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const buscar = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const djangoUrl =
        process.env.NEXT_PUBLIC_DJANGO_API_URL?.replace("/api/", "") ||
        "http://localhost:8000";
      const res = await fetch(
        `${djangoUrl}/carnetizacion/api/buscar/?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data = await res.json();
      setResults(data);
    } catch (error: any) {
      console.error("Error en buscar:", error);
      toast.error(`Error al buscar personal: ${error.message || error}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => buscar(value), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    buscar(query);
  };

  return (
    <PageLayout
      title="Buscar Personal"
      description="Busca un trabajador por cédula o nombre para generar su carnet"
    >
      <div className="max-w-3xl mx-auto mt-6 space-y-6">
        {/* Search Card */}
        <Card className="shadow-md border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Search className="h-5 w-5" />
              Búsqueda de Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ingrese cédula o nombre del trabajador..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="pl-10 flex-1"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading || query.length < 2}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-muted-foreground mt-3">
                Buscando en SAGP...
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="text-center py-12">
                <User className="h-14 w-14 mx-auto text-gray-300" />
                <p className="text-lg font-medium text-gray-500 mt-4">
                  Sin resultados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  No se encontraron trabajadores para &quot;{query}&quot;
                </p>
              </CardContent>
            </Card>
          )}

          {!loading &&
            results.map((emp) => (
              <Card
                key={emp.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 shadow-sm border"
                onClick={() =>
                  router.push(
                    `/dashboard/carnetizacion/generar?cedula=${emp.cedula}`,
                  )
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          emp.tiene_carnet
                            ? "bg-emerald-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <IdCard
                          className={`h-6 w-6 ${
                            emp.tiene_carnet
                              ? "text-emerald-700"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {emp.nombre_completo}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span>C.I: {emp.cedula}</span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {emp.codigo}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {emp.cargo} — {emp.departamento}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {emp.tiene_carnet ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Carnet activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Sin carnet
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        {emp.total_solicitudes > 0 && (
                          <span className="text-xs text-muted-foreground">
                            <Printer className="h-3 w-3 inline mr-1" />
                            {emp.total_solicitudes}{" "}
                            {emp.total_solicitudes === 1
                              ? "emisión"
                              : "emisiones"}
                          </span>
                        )}
                        <Button size="sm" variant="outline">
                          Generar Carnet
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </PageLayout>
  );
}
