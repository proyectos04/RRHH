"use client";
import { SignOut } from "@/components/signout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "./gestion-trabajadores/components/loading/loading";
type Department = {
  id: string;
  name: string;
  imageSrc: string;
  href: string;
  color: string;
  alt: string;
};
const departments: Department[] = [
  {
    id: "Seguridad",
    name: "Seguridad",
    imageSrc: "/images/departments/seguridad.jpg",
    href: "/dashboard/seguridad",
    color: "bg-green-500",
    alt: "Sección de seguridad y privacidad.",
  },
  {
    id: "RAC",
    name: "Gestión de Trabajadores",
    imageSrc: "/images/departments/datos.jpg",
    href: "/dashboard/gestion-trabajadores",
    color: "bg-green-500",
    alt: "Human Resources Department",
  },
  {
    id: "Carnetizacion",
    name: "Carnetización",
    imageSrc: "/images/departments/carnetizacion.png",
    href: "/dashboard/carnetizacion",
    color: "bg-blue-500",
    alt: "Sistema de Carnetización",
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "loading") {
    return <Loading promiseMessage="Cargando Sesion" />;
  }

  const handleDepartmentValidation = (
    departmentId: string,
    departmentHref: string,
  ) => {
    if (session?.user?.department.nombre_departamento == departmentId) {
      toast.success(`Bienvenido ${session.user.name}`, {
        style: {
          color: "white",
        },
      });
      router.push(departmentHref);
    } else {
      toast.warning("No puedes acceder a este modulo", {
        style: {
          color: "white",
        },
      });
    }
  };
  return (
    <>
      <div className="flex flex-col items-center mb-10 mt-4">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">
          Sistema de Información Integral
        </h1>
        <p className=" text-2xl text-center text-white ">
          Seleccione un módulo para acceder a sus funciones
        </p>
        <SignOut />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-8 ">
        {departments.map((department, index) => {
          const hasAccess =
            session?.user?.department.nombre_departamento === department.id;
          return (
            <Card
              key={index}
              onClick={() =>
                handleDepartmentValidation(department.id, department.href)
              }
              className={` block transition-all  duration-200 p-0 ${
                hasAccess
                  ? "hover:scale-105 cursor-pointer"
                  : "opacity-75 cursor-not-allowed"
              }`}
            >
              {!hasAccess && (
                <div
                  dir="rtl"
                  className="relative w-fit top-4 end-0 z-10 bg-gray-800 text-white p-1 rounded-full"
                >
                  <Lock size={18} />
                </div>
              )}

              {hasAccess && (
                <div
                  dir="rtl"
                  className="relative w-fit top-4 end-0 z-10 bg-green-700 text-white p-1 rounded-full"
                >
                  <Check size={18} />
                </div>
              )}
              <Image
                height={150}
                width={100}
                src={department.imageSrc}
                alt={department.alt}
                className={`w-full h-60 object-contain ${
                  hasAccess
                    ? `hover:border-primary`
                    : "border-gray-300 bg-gray-100 grayscale"
                } overflow-hidden relative`}
              />
              <Card className="rounded text-center bg-slate-200/25 ">
                <CardHeader>
                  <CardTitle className="text-xl">{department.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center h-full">
                  {hasAccess ? (
                    <p className="text-sm text-gray-700">
                      Tienes acceso a este departamento.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      No tiene acceso a este departamento
                    </p>
                  )}
                </CardContent>
              </Card>
            </Card>
          );
        })}
      </div>
    </>
  );
}
