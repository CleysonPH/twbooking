import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md px-8 py-12 text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        
        {/* Nome do projeto */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">TWBooking</h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            Agendamentos online simples para negócios locais
          </p>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-4 pt-4">
          <Button asChild className="flex-1" size="lg">
            <Link href="/login">Acessar Conta</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/register">
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Conta
            </Link>
          </Button>
        </div>
        
        {/* Footer simples */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Simplifique seus agendamentos</p>
        </div>
      </div>
    </div>
  );
}
