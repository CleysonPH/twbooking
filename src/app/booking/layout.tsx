import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agendamento Online - TWBooking",
  description: "Sistema de agendamento online para prestadores de serviço",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
