import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number");

const schema = z
  .object({
    name: z.string().trim().min(2, "Full name is required").max(80),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(6, "Phone number is required").max(32),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/register")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Create account — CoreHex Rental" },
      { name: "description", content: "Create a CoreHex Rental account to book equipment." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register: registerUser, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/register" });
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: (redirect || "/my-bookings") } as any);
    }
  }, [isAuthenticated, loading, navigate, redirect]);

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values.name, values.email, values.password, { phone: values.phone });
      toast.success("Account created");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: (redirect || "/my-bookings") } as any);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
      if (/exists|registered|duplicate/i.test(msg)) {
        navigate({ to: "/login", search: redirect ? { redirect } : undefined });
      }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow grid place-items-center shadow-[var(--shadow-glow)]">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">CoreHex Rental</span>
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reserve equipment, track bookings, and manage rentals in one place.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" autoComplete="name" {...register("name")} />
              {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" autoComplete="tel" placeholder="+1 415 555 0182" {...register("phone")} />
              {errors.phone && <p className="text-xs text-rose-400">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={redirect ? { redirect } : undefined}
              className="text-primary-glow hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}