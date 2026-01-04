"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { registerSchema } from "@/schemas/register";
import { useRouter } from "next/navigation";
type RegisterValues = z.infer<typeof registerSchema>;

const AnimatedBackground = dynamic(
  () =>
    import("@/components/ui/animated-background").then(
      (mod) => mod.AnimatedBackground
    ),
  { ssr: false }
);

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error, {
        description: "Por favor, intenta de nuevo.",
      });
      reset();
      return;
    }

    toast.success("Cuenta creada exitosamente");
    reset();
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Lado Izquierdo - Visual */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-zinc-950 overflow-hidden text-white relative">
        <AnimatedBackground />

        <div className="relative z-10 max-w-lg text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            ¡Crea tu Cuenta y empieza a usar tu propio chat RAG!
          </h1>

          <div className="space-y-4 text-zinc-400 text-lg">
            <p>
              Accede a una experiencia personalizada de inteligencia artificial
              potenciasa por tus propios datos.
            </p>
          </div>

          {/* Elementos decorativos adicionales estilo boceto si se desea */}
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Crear Cuenta</h2>
            <p className="text-muted-foreground">
              Ingresa tus datos para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                placeholder="nombre@ejemplo.com"
                type="email"
                {...register("email")}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
