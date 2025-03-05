import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Recipe App",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  )
}

