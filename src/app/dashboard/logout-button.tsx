"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      toast.success("Logout realizado com sucesso!")
      await signOut({
        callbackUrl: "/login",
      })
    } catch (error) {
      toast.error("Erro ao fazer logout. Tente novamente.")
      console.error("Logout error:", error)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
    >
      Sair
    </Button>
  )
}
