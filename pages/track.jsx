import { useState, useEffect } from 'react'
import { Search, Smartphone, Check, MapPin, DollarSign, Camera, AlertTriangle, CreditCard, User, Box } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// CONFIGURACIÓN SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPage() {
  // Estado
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // BUSCAR AUTOMÁTICAMENTE SI HAY TOKEN EN LA URL (QR)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token'); // ¡Ahora buscamos por 'token'!
    if (tokenParam) {
      setQuery(tokenParam);
      searchOrder(tokenParam);
    }
  }, []);

  // FUNCIÓN DE BÚSQUEDA SEGURA
  const searchOrder = async (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // AHORA BUSCAMOS POR 'tracking_token' (El código secreto)
      // O por cédula si el usuario escribe manualmente (opcional)
      let dbQuery = supabase.from('orders').select('*')
      
      // Si el texto es largo (parece un UUID), buscamos por token
      if (searchTerm.length > 20) {
          dbQuery = dbQuery.eq('tracking_token', searchTerm);
      } else {
          // Si es corto, asumimos Cédula (NO ID). 
          // Esto evita que adivinen IDs secuenciales.
          dbQuery = dbQuery.eq('customer->>idCard', searchTerm); 
      }

      const { data, error } = await dbQuery.single();

      if (error || !data) {
        setError("No encontramos una orden con ese código.");
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchOrder(query);
  }

  // ESTILOS DE ESTADO
  const getStatusStep = (status) => {
    const steps = ['Recibido', 'Diagnóstico', 'En Reparación', 'Listo para Entregar', 'Entregado'];
    // Mapeamos tus estados a índices (0-4)
    const map = {
      'Recibido': 0, 'Diagnóstico': 1, 'Pendiente Repuesto': 2, 
      'En Reparación': 2, 'Listo para Entregar': 3, 'Entregado': 4,
      'Devuelto (No Reparado)': 4, 'Cancelada': 4
    };
    return map[status] || 0;
  };

  return (
    <div className="min-h-screen font-sans text-slate-700 relative overflow-hidden">
      {/* FONDO PREMIUM (Definido en globals.css o aquí en línea) */}
      <div className="premium-bg"></div>

      {/* ENCABEZADO */}
      <div className="pt-12 pb-6 text-center px-4">
        <div className="inline-flex items-center gap-2 text-blue-600 mb-2">
          <Smartphone className="w-6 h-6 fill-current" />
          <span className="font-bold text-xl tracking-tight">TallerControl</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Estado de Reparación</h1>
        <p className="text-slate-500 text-sm">Rastrea tu equipo en tiempo real</p>
      </div>

      <main className="max-w-md mx-auto px-4 pb-20">
        
        {/* --- TARJETA DE BÚSQUEDA FLOTANTE --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white mb-8">
            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Código de Rastreo o Cédula
              </label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: a1b2-c3d4..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-12 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
                />
                <button 
                  disabled={loading}
                  className="absolute right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Search className="w-5 h-5" />}
                </button>
              </div>
            </form>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="bg-red-50 text-red-500 px-6 py-4 rounded-3xl text-center mb-8 font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* --- RESULTADOS (SOLO SI HAY ORDEN) --- */}
        {order && (
          <div className="animate-fade-in-up space-y-6">
            
            {/* 1. TARJETA DE ESTADO (STEPPER) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-center font-bold text-slate-800 mb-8">Proceso Actual</h3>
              
              <div className="relative flex justify-between items-center px-2">
                {/* Línea de fondo */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10"></div>
                {/* Línea de progreso activa */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 transition-all duration-1000"
                  style={{ width: `${getStatusStep(order.status) * 25}%` }}
                ></div>

                {['Recibido', 'Diagnóstico', 'Reparación', 'Listo', 'Entregado'].map((step, i) => {
                   const currentStep = getStatusStep(order.status);
                   const active = i <= currentStep;
                   const current = i === currentStep;

                   return (
                     <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                          ${active ? 'bg-blue-500 border-blue-100 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-slate-100 text-slate-300'}
                          ${current ? 'scale-125 ring-4 ring-blue-50' : ''}
                        `}>
                          {active ? <Check className="w-5 h-5" /> : <div className="w-2 h-2 bg-slate-200 rounded-full"/>}
                        </div>
                        {current && (
                          <span className="absolute -bottom-8 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {step}
                          </span>
                        )}
                     </div>
                   )
                })}
              </div>
              <div className="h-6"></div> {/* Espacio para la etiqueta flotante */}
            </div>

            {/* 2. GRID DE INFORMACIÓN */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                  <User className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
                <p className="font-bold text-slate-800 text-lg leading-tight mt-1">
                  {order.customer?.firstName}
                </p>
              </div>
              {/* Equipo */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">Equipo</p>
                <p className="font-bold text-slate-800 text-lg leading-tight mt-1">
                  {order.device?.model}
                </p>
              </div>
            </div>

            {/* 3. FALLA REPORTADA */}
            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4 items-start">
              <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase mb-1">Falla Reportada</p>
                <p className="text-amber-900 font-medium leading-snug text-sm">
                  "{order.problemDescription}"
                </p>
              </div>
            </div>

            {/* 4. EVIDENCIA FOTOGRÁFICA */}
            {order.photos && order.photos.length > 0 && (
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm">
                <p className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-400" /> Evidencia
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {order.photos.map((pic, idx) => (
                    <a key={idx} href={pic} target="_blank" className="flex-shrink-0">
                       <img src={pic} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TOTAL A PAGAR (BARRA INFERIOR) */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                   <CreditCard className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase">Pendiente</p>
                   <p className="text-slate-600 text-xs">Total a pagar</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black text-slate-800">
                   ${order.finance?.pendingBalance?.toFixed(2)}
                 </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}