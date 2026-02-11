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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <AnimatedBackground />

      <Card className="w-full max-w-sm relative z-10 border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl rounded-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <CardHeader className="space-y-1 text-center pb-2">
           <div className="mx-auto w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-sm" />
           </div>
          <CardTitle className="text-xl font-medium tracking-tight text-white font-mono uppercase">
            Access Portal
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs font-mono">
            Enter credentials for authorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                Identity / Email
              </Label>
              <Input
                id="email"
                placeholder="OPERATOR_ID"
                type="email"
                {...register("email")}
                className={`bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:border-emerald-500/50 transition-colors duration-200 h-10 font-mono text-sm rounded-none ${
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                  Security Key
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-mono text-zinc-600 hover:text-emerald-500 hover:underline transition-colors"
                >
                  RECOVER_KEY?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 pr-10 focus-visible:ring-0 focus-visible:border-emerald-500/50 transition-colors duration-200 h-10 font-mono text-sm rounded-none ${
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

            <Button
              type="submit"
              className="w-full font-mono text-xs uppercase tracking-widest bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 hover:border-emerald-500/50 h-10 rounded-none transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "AUTHENTICATING..." : "INITIATE_SESSION"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-zinc-800/50 pt-6">
          <div className="text-center text-xs font-mono text-zinc-600">
            NO_ACCESS?{" "}
            <Link
              href="/register"
              className="text-zinc-400 hover:text-emerald-400 transition-colors ml-1"
            >
              REQUEST_CLEARANCE
            </Link>
          </div>
          
          <div className="text-[10px] text-zinc-700 text-center font-mono">
            SECURE CONNECTION // ENCRYPTED
          </div>
        </CardFooter>
      </Card>
      
      {/* Footer legal hidden for cleaner aesthetic or moved */}
    </div>
  );
}
