import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | Recipe App",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground">Enter your information to create an account</p>
      </div>
      <RegisterForm />
    </div>
  )
}

