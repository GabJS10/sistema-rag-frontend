"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/schemas/register";
import { motion } from "framer-motion";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Registration failed", {
          description: "Please check your details and try again.",
        });
        return;
      }

      toast.success("Account created", {
        description: "Welcome aboard! Please sign in.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Network error", {
        description: "Could not connect to registration server.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-medium tracking-tight text-white">
          Crear una cuenta
        </h1>
        <p className="text-base text-zinc-400">
          Ingresa tu correo electrónico para comenzar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400 font-medium">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register("email")}
              className={`bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 focus-visible:border-zinc-600 h-12 rounded-xl transition-all ${
                errors.email ? "border-red-500/50 focus-visible:ring-red-500/50" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-400 font-medium mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-400 font-medium">
              Contraseña
            </Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                {...register("password")}
                className={`bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 focus-visible:border-zinc-600 h-12 rounded-xl pr-10 transition-all ${
                  errors.password ? "border-red-500/50 focus-visible:ring-red-500/50" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-400 font-medium">
              Confirmar Contraseña
            </Label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 focus-visible:border-zinc-600 h-12 rounded-xl pr-10 transition-all ${
                  errors.confirmPassword ? "border-red-500/50 focus-visible:ring-red-500/50" : ""
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 font-medium mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 font-medium text-[15px] rounded-xl transition-all shadow-lg shadow-zinc-950/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <div className="flex items-center gap-2">
              Crear Cuenta <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-zinc-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="text-zinc-300 hover:text-white font-medium transition-colors underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </motion.div>
  );
}