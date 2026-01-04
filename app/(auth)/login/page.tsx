"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schemas/login";

type LoginValues = z.infer<typeof loginSchema>;

const AnimatedBackground = dynamic(
  () =>
    import("@/components/ui/animated-background").then(
      (mod) => mod.AnimatedBackground
    ),
  { ssr: false }
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    reset();
    toast.success("Has iniciado sesión correctamente");
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 overflow-hidden relative">
      <AnimatedBackground />

      <Card className="w-full max-w-md relative z-10 border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Bienvenido de nuevo
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                placeholder="nombre@ejemplo.com"
                type="email"
                {...register("email")}
                className={`bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-500 transition-colors duration-200 ${
                  errors.email
                    ? "border-red-500 focus-visible:border-red-500"
                    : "hover:border-zinc-700"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-zinc-400 hover:text-white hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-500 transition-colors duration-200 ${
                    errors.password
                      ? "border-red-500 focus-visible:border-red-500"
                      : "hover:border-zinc-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
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

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-zinc-800 pt-6">
          <div className="text-center text-sm text-zinc-400">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-white hover:underline transition-colors"
            >
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>

      <div className="absolute bottom-4 text-center text-xs text-zinc-500 z-10 hidden md:block">
        <p>
          Al continuar, aceptas nuestros{" "}
          <Link href="/terms" className="underline hover:text-zinc-400">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacy" className="underline hover:text-zinc-400">
            Política de Privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
