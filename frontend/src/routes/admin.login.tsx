import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Hexagon, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import logo from "@/assets/logo.png";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — CoreHex Rental" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, logout, isAuthenticated, user } = useAdminAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAuthenticated, user, navigate]);

  async function onSubmit(values: FormValues) {
    try {
      const u = await login(values.email, values.password, values.remember);
      if (u.role !== "admin") {
        await logout();
        toast.error("This account does not have administrator access.");
        return;
      }
      toast.success("Welcome back");
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="CoreHex Rental" className="size-12 rounded-lg" />
          <div className="font-display text-lg font-semibold">CoreHex Admin</div>
        </div>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold">Sign in to console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage equipment, bookings, and operations.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => toast.message("Contact your workspace owner to reset")}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={!!watch("remember")}
                onCheckedChange={(v) => setValue("remember", !!v)}
              />
              Remember me on this device
            </label>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}