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
    },
    {
      href: "/dashboard/config",
      label: "Configurações",
      isActive: pathname === "/dashboard/config"
    }
  ]

  return (
    <nav className={cn("w-full", className)}>
      {/* Mobile: scroll horizontal */}
      <div className="flex overflow-x-auto gap-2 pb-2 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0",
              item.isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* Desktop: flex row */}
      <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              item.isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
