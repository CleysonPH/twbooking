'use client'

import { useState, useEffect } from "react"
import { ExternalLink, Copy, Check } from "lucide-react"

interface PublicLinkCardProps {
  customLink: string
}

export function PublicLinkCard({ customLink }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  
  useEffect(() => {
    // Usar window.location.origin no lado do cliente
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    setPublicUrl(`${baseUrl}/booking/${customLink}`)
  }, [customLink])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      // Fallback para browsers que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = publicUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenInNewTab = () => {
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }

  if (!publicUrl) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-4"></div>
          <div className="h-10 bg-muted rounded mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-20"></div>
            <div className="h-10 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Link Público</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Compartilhe este link para que seus clientes possam agendar seus serviços
      </p>
      
      <div className="bg-muted rounded-md p-3 mb-4 break-all text-sm font-mono border">
        {publicUrl}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleOpenInNewTab}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Abrir link em nova aba"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir
        </button>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          title={copied ? "Link copiado!" : "Copiar link"}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
