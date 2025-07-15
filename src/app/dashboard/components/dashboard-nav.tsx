"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      isActive: pathname === "/dashboard"
    },
    {
      href: "/dashboard/appointments",
      label: "Agendamentos",
      isActive: pathname === "/dashboard/appointments"
    },
    {
      href: "/dashboard/services",
      label: "Serviços",
      isActive: pathname === "/dashboard/services"
    },
    {
      href: "/dashboard/availability",
      label: "Disponibilidade",
      isActive: pathname === "/dashboard/availability"
    }
  ]

  return (
    <nav className={cn("flex space-x-4", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
            item.isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
