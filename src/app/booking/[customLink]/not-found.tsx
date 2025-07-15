import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Prestador não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              O link que você está tentando acessar não foi encontrado ou pode ter sido alterado.
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique se o link está correto e tente novamente.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                Voltar à página inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
