"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema, changePasswordSchema } from "@/lib/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { loginAction, changePasswordAction } from "#/actions/auth-actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/app/(protected)/dashboard/gestion-trabajadores/components/loading/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const changeForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const [isChangingPass, startChangePass] = useTransition();

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(values);
      if (response?.error) {
        setError(response.error);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.debeCambiarPassword) {
          setUserId(session.user.id);
          setShowChangePassword(true);
        } else {
          router.push("/dashboard");
        }
      }
    });
  }

  async function onChangePassword(values: z.infer<typeof changePasswordSchema>) {
    startChangePass(async () => {
      const response = await changePasswordAction(userId, values.new_password);
      if (response.success) {
        await updateSession();
        setShowChangePassword(false);
        router.push("/dashboard");
      } else {
        changeForm.setError("new_password", {
          message: response.message || "Error al cambiar la contraseña",
        });
      }
    });
  }

  return (
    <>
      <Form {...form}>
        {isPending && !showChangePassword ? (
          <Loading
            className="bg-transparent border-none text-white shadow-none"
            promiseMessage="Validando Credenciales"
          />
        ) : (
          <form
            className={cn("flex flex-col gap-6 ", className)}
            {...props}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">
                Inicia Sesión Con Tus Credenciales
              </h1>
            </div>
            <div className="grid gap-6 ">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico:</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="correo@conatel.gob.ve"
                          {...field}
                          className={
                            "transition-property: all transition-duration: 300ms placeholder:text-white hover:bg-slate-900/20"
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-white">
                        Introduce tu correo electrónico institucional.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña:</FormLabel>
                      <FormControl>
                        <Input
                          type={"password"}
                          placeholder="Tu Contraseña"
                          className=" hover:bg-slate-900/20 placeholder:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-white">
                        Coloque su contraseña de acceso.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {error && <FormMessage>{error}</FormMessage>}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </div>
          </form>
        )}
      </Form>

      <Dialog
        open={showChangePassword}
        onOpenChange={(open) => {
          if (!open) return;
          setShowChangePassword(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Debe cambiar su contraseña para continuar. Esta es una medida de
              seguridad obligatoria.
            </DialogDescription>
          </DialogHeader>

          <Form {...changeForm}>
            <form
              onSubmit={changeForm.handleSubmit(onChangePassword)}
              className="space-y-4"
            >
              <FormField
                control={changeForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changeForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isChangingPass}
                className="w-full"
              >
                {isChangingPass ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
