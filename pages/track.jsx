import { useState, useEffect } from 'react'
import { Search, Smartphone, Wrench, CheckCircle, Clock, AlertCircle, Loader2, Camera, User, HardDrive, DollarSign, CalendarDays } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// 1. Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Componente de Barra de Progreso (Progress Tracker)
const ProgressTracker = ({ currentStatus }) => {
  const statuses = [
    { name: 'Recibido', icon: <CheckCircle className="h-5 w-5" /> },
    { name: 'Diagnóstico', icon: <Search className="h-5 w-5" /> },
    { name: 'En Reparación', icon: <Wrench className="h-5 w-5" /> },
    { name: 'Listo para Entregar', icon: <Smartphone className="h-5 w-5" /> }, // Ajustado para coincidir con tus estados exactos
    { name: 'Entregado', icon: <DollarSign className="h-5 w-5" /> },
  ];

  const getStatusIndex = (statusName) => statuses.findIndex(s => s.name === statusName);
  // Si el estado no está en la lista (ej: Cancelada), ponemos -1 o manejamos el error
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="flex justify-between items-center py-4 px-2 relative">
      {/* Línea de progreso de fondo */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 z-0 mx-8">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out rounded-full" 
          style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
        ></div>
      </div>

      {statuses.map((status, index) => (
        <div key={status.name} className="flex flex-col items-center z-10 relative">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${index <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} 
              transition-all duration-300 ease-in-out shadow-md border-2 ${index <= currentIndex ? 'border-blue-600' : 'border-white'}`}
          >
            {status.icon}
          </div>
          <p 
            className={`mt-2 text-[10px] sm:text-xs font-medium text-center absolute -bottom-6 w-24 
              ${index <= currentIndex ? 'text-blue-700' : 'text-gray-400'}`}
          >
            {status.name === 'Listo para Entregar' ? 'Listo' : status.name}
          </p>
        </div>
      ))}
    </div>
  );
};

// 3. Componente Principal de la Página
function TrackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  // Detectar si viene un ID en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam) {
        setSearchQuery(idParam);
        handleSearch(null, idParam);
      }
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
      
      const isNumeric = !isNaN(queryToSearch)
      
      if (isNumeric && queryToSearch.length < 8) {
         query = query.eq('id', queryToSearch)
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Wrench className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TallerControl</span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Estado de Reparación
          </h1>
          <p className="text-lg text-gray-600">
            Ingresa tu cédula o número de orden
          </p>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl mb-12 border border-gray-100 transform transition-all hover:scale-[1.01]">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400 text-base"
              placeholder="Ej: 26888999 o N° Orden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center text-base shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Search className="h-5 w-5 mr-2"/>}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 p-4 rounded-xl flex items-center text-red-700 border border-red-100 shadow-sm animate-pulse">
              <AlertCircle className="h-5 w-5 mr-3" /> {error}
            </div>
          )}

          {searched && !loading && orders.length === 0 && !error && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl font-semibold text-gray-700">No encontramos ninguna orden</p>
              <p className="mt-2 text-gray-500">Verifica los datos e intenta nuevamente.</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
              
              {/* Encabezado y Estado */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Orden de Servicio</p>
                  <p className="text-4xl font-bold text-white leading-tight">#{order.id}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)} shadow-lg border border-white/20`}>
                  {order.status}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="px-4 sm:px-8 py-8 bg-gray-50 border-b border-gray-100">
                <ProgressTracker currentStatus={order.status} />
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Datos del Cliente */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Cliente</p>
                      <p className="text-lg font-bold text-gray-900 leading-tight">
                        {order.customer?.firstName || 'Nombre no disponible'} {order.customer?.lastName || ''}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">ID: {order.customer?.idCard || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Datos del Equipo */}
                  <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Smartphone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Equipo</p>
                      <p className="text-lg font-bold text-gray-900 leading-tight">
                        {order.device?.brand || 'Marca no disponible'} {order.device?.model || ''}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Color: {order.device?.color || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Fecha y Falla */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                        <CalendarDays className="h-5 w-5 text-gray-500" />
                        <div>
                            <span className="text-sm font-medium text-gray-500 mr-2">Recibido el:</span>
                            <span className="text-base font-bold text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    
                    {order.problemDescription && (
                    <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
                        <div className="flex items-center mb-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <p className="text-xs font-bold uppercase tracking-wider">Falla Reportada</p>
                        </div>
                        <p className="text-gray-800 text-base font-medium leading-relaxed">{order.problemDescription}</p>
                    </div>
                    )}
                </div>

                {/* --- SECCIÓN DE FOTOS --- */}
                {order.photos && order.photos.length > 0 && (
                  <div className="mt-8 mb-8">
                    <div className="flex items-center mb-4">
                      <Camera className="h-5 w-5 text-gray-600 mr-2" />
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Evidencia Fotográfica</p>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"> 
                      {order.photos.map((photoUrl, index) => (
                        <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 snap-center">
                          <img 
                            src={photoUrl} 
                            alt={`Evidencia ${index + 1}`} 
                            className="h-32 w-32 object-cover rounded-xl border-2 border-white shadow-md hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Costos y Balance */}
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Estimado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${order.finance?.repairCost?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="bg-red-50 px-6 py-3 rounded-xl border border-red-100 w-full sm:w-auto text-right sm:text-left">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Pendiente por Pagar</p>
                    <p className="text-3xl font-extrabold text-red-600">
                      ${order.finance?.pendingBalance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// 4. Exportación Final (¡AQUÍ ESTABA EL PROBLEMA!)
export default TrackPage