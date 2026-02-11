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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Lado Izquierdo - Visual */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden text-white relative border-r border-white/5">
        <AnimatedBackground />

        <div className="relative z-10 max-w-lg text-center space-y-8">
           <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500" />
              <div className="text-4xl font-mono font-bold text-white tracking-tighter">RAG</div>
           </div>
           
          <h1 className="text-3xl font-medium tracking-tight leading-tight text-white">
            Initialize Intelligence Node
          </h1>

          <div className="space-y-4 text-zinc-500 text-sm font-mono max-w-sm mx-auto">
            <p>
              &gt; Establish secure connection<br/>
              &gt; Index proprietary data<br/>
              &gt; Deploy autonomous agents
            </p>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-background to-background pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left space-y-2 border-b border-zinc-800 pb-6">
            <h2 className="text-xl font-mono uppercase tracking-widest text-white">New User Registration</h2>
            <p className="text-zinc-500 text-xs font-mono">
              Complete protocol to gain system access
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Email Address</Label>
              <Input
                id="email"
                placeholder="CONTACT@DOMAIN.COM"
                type="email"
                {...register("email")}
                className={`bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:border-emerald-500/50 transition-colors duration-200 h-10 font-mono text-sm rounded-none ${
                  errors.email
                    ? "border-red-900/50 focus-visible:border-red-900"
                    : "hover:border-zinc-700"
                }`}
              />
              {errors.email ? (
                <p className="text-[10px] text-red-500 font-mono">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Set Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700 pr-10 focus-visible:ring-0 focus-visible:border-emerald-500/50 transition-colors duration-200 h-10 font-mono text-sm rounded-none ${
                    errors.password
                      ? "border-red-900/50 focus-visible:border-red-900"
                      : "hover:border-zinc-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-[10px] text-red-500 font-mono">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700 pr-10 focus-visible:ring-0 focus-visible:border-emerald-500/50 transition-colors duration-200 h-10 font-mono text-sm rounded-none ${
                    errors.confirmPassword
                      ? "border-red-900/50 focus-visible:border-red-900"
                      : "hover:border-zinc-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-[10px] text-red-500 font-mono">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full font-mono text-xs uppercase tracking-widest bg-white text-black hover:bg-zinc-200 border border-transparent h-10 rounded-none transition-all mt-6" disabled={isSubmitting}>
              {isSubmitting ? "PROCESSING..." : "REGISTER_IDENTITY"}
            </Button>

            <div className="text-center text-xs text-zinc-600 mt-4 font-mono">
              ALREADY_AUTHENTICATED?{" "}
              <Link
                href="/login"
                className="text-emerald-500 hover:text-emerald-400 hover:underline"
              >
                LOGIN_CONSOLE
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
