import { useState, useEffect } from 'react'
import { Search, Smartphone, Wrench, CheckCircle, Clock, AlertCircle, Loader2, Camera } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  // Detectar si viene un ID en la URL (por si escanean el QR)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSearchQuery(idParam);
      handleSearch(null, idParam); // Buscar automáticamente
    }
  }, []);

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

  const handleSearch = async (e, manualQuery = null) => {
    if (e) e.preventDefault()
    const queryToSearch = manualQuery || searchQuery;
    
    if (!queryToSearch.trim()) return

    setLoading(true)
    setError(null)
    setSearched(true)
    setOrders([])

    try {
      let query = supabase.from('orders').select('*')
      
      // Intentamos buscar si es un número (ID de orden) o texto (Cédula)
      const isNumeric = !isNaN(queryToSearch)
      
      if (isNumeric && queryToSearch.length < 8) {
         // Asumimos ID de orden
         query = query.eq('id', queryToSearch)
      } else {
         // Buscamos dentro del JSON del cliente (Cédula o Teléfono)
         query = query.or(`customer->>idCard.eq.${queryToSearch},customer->>phone.ilike.%${queryToSearch}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
      
    } catch (err) {
      console.error('Error buscando:', err)
      setError('Ocurrió un error al buscar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TallerControl</span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Estado de Reparación</h1>
          <p className="text-gray-600">Ingresa tu cédula o número de orden</p>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="Ej: 26888999 o N° Orden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-xl flex items-center text-red-700 border border-red-100">
              <AlertCircle className="h-5 w-5 mr-2" /> {error}
            </div>
          )}

          {searched && !loading && orders.length === 0 && !error && (
            <div className="text-center py-10 text-gray-500">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No encontramos ninguna orden con esos datos.</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Encabezado de la Tarjeta */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Orden #{order.id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Datos del Cliente (Protegido con ?.) */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cliente</p>
                    <p className="text-lg font-medium text-gray-900">
                      {order.customer?.firstName || 'Nombre no disp.'} {order.customer?.lastName || ''}
                    </p>
                    <p className="text-sm text-gray-500">{order.customer?.idCard || 'ID no disp.'}</p>
                  </div>

                  {/* Datos del Equipo (Protegido con ?.) */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Equipo</p>
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.device?.brand || 'Marca?'} {order.device?.model || ''}
                        </p>
                        <p className="text-sm text-gray-500">Color: {order.device?.color || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción de la Falla */}
                {order.problemDescription && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Falla Reportada</p>
                    <p className="text-gray-800 text-sm">{order.problemDescription}</p>
                  </div>
                )}

                {/* --- SECCIÓN DE FOTOS --- */}
                {order.photos && order.photos.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center mb-3">
                      <Camera className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-xs font-semibold text-gray-400 uppercase">Evidencia Fotográfica</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.photos.map((photoUrl, index) => (
                        <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={photoUrl} 
                            alt={`Evidencia ${index + 1}`} 
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Costos (Opcional, si quieres que el cliente lo vea) */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total a pagar (Restante)</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${order.finance?.pendingBalance?.toFixed(2) || '0.00'}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}