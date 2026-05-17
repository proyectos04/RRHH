import { ApiResponse } from "@/app/types/types";
import { signInSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
export interface SessionType {
  cedula: string;
  id: string;
  nombres: string;
  apellidos: string;
  departamento: {
    id: number;
    nombre_departamento: string;
  };
  rol: {
    id: number;
    nombre_rol: string;
  };
  email: string;
  phone: string;
  status: string;
  direccion_general: {
    id: string;
    nombre: string;
  };
  direccion_linea: {
    id: string;
    nombre: string;
  } | null;
  coordinacion: { id: string; nombre: string } | null;
  dependencia: {
    id: string;
    nombre: string;
  };
}
export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = signInSchema.safeParse(credentials);
        if (!success) {
          throw new Error("Invalid credentials.");
        }
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}accounts/login/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                cedula: data.identification,
                password: data.password,
              }),
            },
          );
          if (!response.ok) {
            throw new Error("Invalid credentials.");
          }
          const userData: ApiResponse<SessionType> = await response.json();
          return {
            id: userData.data.id,
            name: userData.data.nombres + " " + userData.data.apellidos,
            role: userData.data.rol,
            department: userData.data.departamento,
            cedula: userData.data.cedula,
            phone: userData.data.phone,
            email: userData.data.email,
            directionGeneral: userData.data.direccion_general,
            direccionLine: userData.data.direccion_linea,
            coordination: userData.data.coordinacion,
            dependency: userData.data.dependencia,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
