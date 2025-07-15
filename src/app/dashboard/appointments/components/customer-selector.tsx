"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, User, Loader2 } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  _count?: {
    bookings: number
  }
}

interface CustomerData {
  name: string
  email: string
  phone: string
}

interface CustomerSelectorProps {
  selectedCustomer?: Customer | null
  customerData?: CustomerData
  onCustomerSelect: (customer: Customer | null) => void
  onCustomerDataChange: (data: CustomerData) => void
  isLoading?: boolean
}

export function CustomerSelector({ 
  selectedCustomer, 
  customerData = { name: '', email: '', phone: '' },
  onCustomerSelect, 
  onCustomerDataChange,
  isLoading = false 
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Estados do formulário
  const [name, setName] = useState(customerData.name)
  const [email, setEmail] = useState(customerData.email)
  const [phone, setPhone] = useState(customerData.phone)

  // Atualizar dados do formulário quando os campos mudarem
  useEffect(() => {
    onCustomerDataChange({
      name,
      email,
      phone
    })
  }, [name, email, phone, onCustomerDataChange])

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes')
      }
      
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchCustomers])

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    setShowCreateForm(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleCreateNewCustomer = () => {
    setShowCreateForm(true)
    onCustomerSelect(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleBackToSearch = () => {
    setShowCreateForm(false)
    setName('')
    setEmail('')
    setPhone('')
  }

  if (selectedCustomer) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Cliente Selecionado</h3>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2" />
                {selectedCustomer.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedCustomer._count && (
                  <Badge variant="secondary">
                    {selectedCustomer._count.bookings} agendamento{selectedCustomer._count.bookings !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>📧 {selectedCustomer.email}</p>
              <p>📱 {selectedCustomer.phone}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => onCustomerSelect(null)}
              disabled={isLoading}
            >
              Escolher Outro Cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dados do Novo Cliente</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToSearch}
            disabled={isLoading}
          >
            Voltar à Busca
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Nome *</Label>
            <Input
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo do cliente"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">E-mail *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Telefone *</Label>
            <Input
              id="customerPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecionar Cliente</h3>
        <p className="text-sm text-muted-foreground">
          Busque um cliente existente ou crie um novo.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite nome, e-mail ou telefone para buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} cliente{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}:
            </p>
            {searchResults.map((customer) => (
              <Card 
                key={customer.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleCustomerSelect(customer)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{customer.name}</CardTitle>
                    {customer._count && (
                      <Badge variant="outline" className="text-xs">
                        {customer._count.bookings} agendamento{customer._count.bookings !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>📧 {customer.email}</p>
                    <p>📱 {customer.phone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhum cliente encontrado com &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleCreateNewCustomer}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Cliente
          </Button>
        </div>
      </div>
    </div>
  )
}
