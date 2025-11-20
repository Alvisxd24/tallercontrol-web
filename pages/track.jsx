import { useState } from 'react'
import { Search, Smartphone, Wrench, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (reemplaza con tus credenciales si no usan variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const getStatusColor = (status) => {
    const colors = {
      'Recibido': 'bg-blue-100 text-blue-800',
      'Diagnóstico': 'bg-purple-100 text-purple-800',
      'Pendiente Repuesto': 'bg-yellow-100 text-yellow-800',
      'En Reparación': 'bg-indigo-100 text-indigo-800',
      'Listo para Entregar': 'bg-green-100 text-green-800',
      'Entregado': 'bg-gray-100 text-gray-800',
      'Devuelto (No Reparado)': 'bg-red-100 text-red-800',
      'Cancelada': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setSearched(true)
    setOrders([])

    try {
      // Buscamos en la columna 'customer' dentro del JSONB
      // Nota: Asumimos que 'customer' tiene un campo 'idCard' o buscamos por ID de orden
      let query = supabase
        .from('orders')
        .select('*')
        
      // Intentamos buscar si es un número (ID de orden) o texto (Cédula)
      const isNumeric = !isNaN(searchQuery)
      
      if (isNumeric && searchQuery.length < 8) {
         // Si es corto, asumimos que es ID de orden
         query = query.eq('id', searchQuery)
      } else {
         // Si es largo, buscamos dentro del JSON del cliente
         // La sintaxis para buscar en JSONB en Supabase:
         query = query.or(`customer->>idCard.eq.${searchQuery},customer->>phone.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      
      if (data) {
        setOrders(data)
      }
    } catch (err) {
      console.error('Error buscando:', err)
      setError('Ocurrió un error al buscar la orden. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AlvisControlCell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rastrea tu Reparación
          </h1>
          <p className="text-lg text-gray-600">
            Ingresa tu número de cédula, teléfono o número de orden para ver el estado.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900" // Agregado text-gray-900 para asegurar color visible
                placeholder="Ej: 26888999, 0412..., o N° Orden"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Buscando...
                </>
              ) : (
                'Rastrear'
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {searched && !loading && orders.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No se encontraron órdenes</h3>
              <p className="mt-2 text-gray-500">Verifica los datos e intenta nuevamente.</p>
            </div>
          )}

          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Orden #{order.id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('es-VE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.customer && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Cliente</p>
                    {/* AQUÍ ESTABA EL ERROR: Se eliminó JSON.parse() */}
                    <p className="font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                )}
                
                {order.device && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Dispositivo</p>
                    {/* AQUÍ ESTABA EL ERROR: Se eliminó JSON.parse() */}
                    <p className="font-medium text-gray-900">
                      {order.device.brand} {order.device.model}
                    </p>
                  </div>
                )}
              </div>

              {order.problemDescription && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Problema Reportado</p>
                  <p className="text-gray-700">{order.problemDescription}</p>
                </div>
              )}

              {/* Timeline simplificado */}
              <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Actualizado hace poco</span>
                </div>
                {order.delivered_at && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Entregado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}