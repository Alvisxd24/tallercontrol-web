import { useState, useEffect } from 'react'
import { Search, Smartphone, Wrench, CheckCircle, Package, AlertCircle, Loader2, Camera, User, CreditCard, Calendar, ChevronRight } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- COMPONENTE DE PROGRESO (ESTILO PREMIUM) ---
const ProgressTracker = ({ currentStatus }) => {
  const statuses = [
    { name: 'Recibido', icon: CheckCircle },
    { name: 'Diagnóstico', icon: Search },
    { name: 'En Reparación', icon: Wrench },
    { name: 'Listo', icon: Smartphone },
    { name: 'Entregado', icon: Package },
  ];

  const getStatusIndex = (statusName) => {
    const map = {
      'Recibido': 0, 'Diagnóstico': 1, 'Pendiente Repuesto': 2, 
      'En Reparación': 2, 'Listo para Entregar': 3, 'Entregado': 4
    };
    return map[statusName] || 0;
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="relative px-4 py-8">
      {/* Barra de fondo */}
      <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2 z-0"></div>
      
      {/* Barra de progreso activa (Animada) */}
      <div 
        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full -translate-y-1/2 z-0 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.6)]"
        style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
      ></div>

      <div className="relative z-10 flex justify-between">
        {statuses.map((status, index) => {
          const Icon = status.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.name} className="flex flex-col items-center group">
              <div 
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                  ${isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                    : 'bg-white text-gray-300 border-2 border-gray-100'}
                  ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                `}
              >
                <Icon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} />
              </div>
              
              <span className={`
                absolute mt-14 text-xs font-bold tracking-wide transition-colors duration-300 w-20 text-center
                ${isActive ? 'text-blue-600' : 'text-gray-300'}
              `}>
                {status.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSearchQuery(idParam);
      handleSearch(null, idParam);
    }
  }, []);

  const getStatusStyle = (status) => {
    // Estilos de "Pildora" para el estado
    const styles = {
      'Recibido': 'bg-blue-100 text-blue-700 border-blue-200',
      'Diagnóstico': 'bg-purple-100 text-purple-700 border-purple-200',
      'En Reparación': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Listo para Entregar': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Entregado': 'bg-gray-100 text-gray-700 border-gray-200',
      'Cancelada': 'bg-red-50 text-red-600 border-red-100',
    };
    return styles[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const handleSearch = async (e, manualQuery = null) => {
    if (e) e.preventDefault()
    const queryToSearch = manualQuery || searchQuery;
    if (!queryToSearch.trim()) return

    setLoading(true); setError(null); setSearched(true); setOrders([]);

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
      console.error(err)
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // FONDO GENERAL: Degradado sutil pero elegante
    <div className="min-h-screen bg-[#F3F6F8] text-slate-800 font-sans pb-20 selection:bg-blue-100">
      
      {/* --- HEADER TIPO APP --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-violet-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              TallerControl
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Seguimiento en Vivo
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-10">
        
        {/* --- SECCIÓN DE BIENVENIDA --- */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            ¿Cómo va tu <span className="text-blue-600">reparación?</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Ingresa tu ID de orden o cédula para ver el estado.
          </p>
        </div>

        {/* --- BUSCADOR FLOTANTE (GLASS EFFECT) --- */}
        <div className="relative group z-30 mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 ring-1 ring-slate-900/5">
            <div className="pl-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: 12345 o Cédula"
              className="w-full bg-transparent p-4 text-lg font-medium text-slate-700 placeholder:text-slate-400 outline-none"
            />
            <button 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </form>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {searched && !loading && orders.length === 0 && !error && (
            <div className="text-center py-16 opacity-50 animate-fade-in-up">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No encontramos esa orden.</p>
            </div>
          )}

          {orders.map((order) => (
            // --- TARJETA PRINCIPAL DE LA ORDEN ---
            <div key={order.id} className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-1 ring-slate-100 overflow-hidden animate-fade-in-up transition-all hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)]">
              
              {/* Encabezado de Tarjeta */}
              <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orden ID</p>
                  <p className="text-2xl font-black text-slate-800">#{order.id}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                  {order.status}
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="py-6 bg-white">
                 <ProgressTracker currentStatus={order.status} />
              </div>

              {/* Contenido Principal */}
              <div className="p-6 sm:p-8 space-y-8">
                
                {/* Grid de Información */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Caja Cliente */}
                  <div className="group p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-blue-400 uppercase">Cliente</span>
                    </div>
                    <p className="font-bold text-slate-800 text-lg">
                      {order.customer?.firstName || 'Anonimo'} {order.customer?.lastName || ''}
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {order.customer?.idCard}
                    </p>
                  </div>

                  {/* Caja Dispositivo */}
                  <div className="group p-5 rounded-2xl bg-violet-50/50 border border-violet-100 hover:border-violet-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-violet-400 uppercase">Dispositivo</span>
                    </div>
                    <p className="font-bold text-slate-800 text-lg">
                      {order.device?.brand} {order.device?.model}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                       <p className="text-sm text-slate-500 font-medium">{order.device?.color || 'Sin color'}</p>
                    </div>
                  </div>
                </div>

                {/* Falla Reportada (Nota Amarilla) */}
                {order.problemDescription && (
                  <div className="relative p-6 rounded-2xl bg-amber-50 border border-amber-100">
                     <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-2xl"></div>
                     <h4 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" /> Reporte de Falla
                     </h4>
                     <p className="text-slate-700 font-medium leading-relaxed">
                       "{order.problemDescription}"
                     </p>
                  </div>
                )}

                {/* Galería de Evidencia */}
                {order.photos && order.photos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Evidencia Fotográfica
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                      {order.photos.map((photo, idx) => (
                        <a key={idx} href={photo} target="_blank" rel="noreferrer" className="relative group flex-shrink-0">
                          <img 
                            src={photo} 
                            className="w-24 h-24 object-cover rounded-xl shadow-sm ring-2 ring-white group-hover:ring-blue-500 transition-all transform group-hover:scale-105"
                            alt="Evidencia" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors"></div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pie de Tarjeta: Costos */}
                <div className="pt-6 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-medium uppercase">Fecha de Ingreso</p>
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium uppercase mb-1">Saldo Pendiente</p>
                      <div className="flex items-center justify-end gap-1 text-3xl font-black text-slate-800">
                        <span className="text-lg text-slate-400 font-normal">$</span>
                        {order.finance?.pendingBalance?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Barra inferior decorativa */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}