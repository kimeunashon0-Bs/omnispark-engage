"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Crown, Loader2, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { adminLogin } from "@/lib/store"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError("")
    
    try {
      const admin = await adminLogin(data.email, data.password)
      if (admin) {
        router.push("/admin")
      } else {
        setError("Invalid admin credentials")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-premium px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Premium Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold shadow-gold mb-4">
            <Crown className="h-8 w-8 text-navy" />
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-white">Nexus Admin</h1>
          <p className="text-white/60 mt-1">System Control Center</p>
        </div>

        <Card className="border-0 shadow-premium bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
              <Lock className="h-5 w-5 text-gold" />
            </div>
            <CardTitle className="text-xl font-semibold">Admin Access</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the platform controls
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}
              
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="admin@platform.com"
                    className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <FieldError>{form.formState.errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <FieldError>{form.formState.errors.password.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-gold text-primary font-semibold hover:opacity-90 transition-opacity shadow-gold" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Access Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-center text-sm text-muted-foreground">Demo credentials:</p>
                <p className="font-mono text-xs mt-1 text-center text-foreground">
                  admin@platform.com / admin123
                </p>
              </div>

              <div className="text-center text-sm">
                <Link href="/login" className="text-gold hover:text-gold-dark transition-colors">
                  Return to Client Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/40 text-xs">
          <Lock className="h-3 w-3" />
          <span>256-bit SSL Encrypted Connection</span>
        </div>
      </div>
    </div>
  )
}
