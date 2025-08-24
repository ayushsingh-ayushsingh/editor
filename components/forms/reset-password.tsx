"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { authClient } from "@/lib/auth-client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must not exceed 64 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must not exceed 64 characters"),
})

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match!")
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } else {
      toast.success("Password changed successfully.");
      form.reset();
      router.push("/login");
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <Link href={"/"} className="flex items-center gap-0 text-sm text-muted-foreground w-min p-0">
                  <ArrowLeft className="size-4" /><span>Home</span>
                </Link>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-muted-foreground text-balance">
                    Create new password
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false)

                    return (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false)

                    return (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {
                    isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : "Reset Password"
                  }
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or
                  </span>
                </div>
                <div className="text-center text-sm flex gap-2 justify-center">
                  <span>Continue with</span>
                  <Link href="login" className="underline underline-offset-4">
                    Login
                  </Link>
                  <span>or</span>
                  <Link href="signup" className="underline underline-offset-4">
                    Signup
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.jpg"
              width={1000}
              height={1000}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.9] dark:saturate-90"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        <span className="hidden md:block">
          Crafted with ❤️ by{" "} <a href="https://github.com/ayushsingh-ayushsingh" className="underline" target="_blank" rel="noopener noreferrer">Ayush Singh</a>
          {" "} | {" "}&copy; {new Date().getFullYear()} All rights reserved.
        </span>
        <span className="block md:hidden">
          Crafted with ❤️ by{" "} <a href="https://github.com/ayushsingh-ayushsingh" className="underline" target="_blank" rel="noopener noreferrer">Ayush Singh</a>
        </span>
      </div>
    </div>
  )
}
