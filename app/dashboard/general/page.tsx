"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormValues } from "@/schemas/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/chat/sidebar-context";
import { PanelRightClose } from "lucide-react";
import { SettingsNav } from "@/components/dashboard/settings-nav";
export default function GeneralSettingsPage() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen: isSidebarOpen, toggle: onToggleSidebar } = useSidebar();

  console.log(user);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.nombre || "",
      birthDate: user?.fecha_nacimiento || "",
      avatarUrl: user?.avatar_url || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = form;

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await fetch("/api/dashboard/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: data.firstName,
          fecha_nacimiento: data.birthDate || null,
          avatar_url: data.avatarUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update profile");
      }

      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al actualizar el perfil");
    }
  };

  const handleAvatarChange = async () => {
    setIsUploading(true);
    try {
      // Simulate avatar upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockUrl = "https://github.com/shadcn.png";
      setValue("avatarUrl", mockUrl);
      toast.success("Foto de perfil actualizada");
    } catch (error) {
      toast.error("Error al actualizar foto de perfil");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const currentAvatar = form.watch("avatarUrl") || user?.avatar_url;
  const currentName = form.watch("firstName") || user?.nombre || "U";

  if (isLoadingUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl px-4 py-12 md:px-8 lg:py-16 lg:ml-12 xl:ml-24 transition-all duration-300">
      <div className="space-y-6">
        <div className="absolute top-4 left-4 z-10">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:bg-muted/50 rounded-lg"
            >
              <PanelRightClose className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Ajustes
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <aside className="md:w-56 shrink-0">
            <SettingsNav />
          </aside>

          <div className="flex-1 max-w-2xl space-y-8">
            <div>
              <h2 className="text-lg font-medium text-foreground">Perfil</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Actualiza tu información personal y foto de perfil.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={currentName}
                    className="h-20 w-20 rounded-full border border-black/5 object-cover shadow-sm ring-4 ring-background dark:border-white/5"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 text-2xl font-semibold text-zinc-600 shadow-sm ring-4 ring-background border border-black/5 dark:border-white/5 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-200">
                    {getInitials(currentName)}
                  </div>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAvatarChange}
                    disabled={isUploading}
                    className="gap-2 bg-transparent dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    Cambiar foto
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombre completo
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={cn(
                      "bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800/80 transition-colors",
                      errors.firstName &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="text-[13px] text-red-500 font-medium">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium">
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register("birthDate")}
                    className={cn(
                      "bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800/80 transition-colors block w-full",
                      errors.birthDate &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.birthDate && (
                    <p className="text-[13px] text-red-500 font-medium">
                      {errors.birthDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px] bg-zinc-900 text-background hover:bg-foreground/90 cursor-pointer gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
