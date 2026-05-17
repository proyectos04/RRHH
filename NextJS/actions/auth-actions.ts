"use server";
import { registerInSchema, signInSchema } from "@/lib/zod";
import { z } from "zod";
import { signIn } from "#/auth";
import { AuthError } from "next-auth";

export const loginAction = async (values: z.infer<typeof signInSchema>) => {
  try {
    await signIn("credentials", {
      identification: values.identification,
      password: values.password,
      redirect: false,
    });
    return { success: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales Invalidas o Usuario Bloqueado" };
    }
    return { error: "Something went wrong" };
  }
};
