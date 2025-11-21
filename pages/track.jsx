import { useState, useEffect } from 'react'
import { Search, Smartphone, Zap, Calendar, User, DollarSign, Camera, X, Phone, Hash, FileText, Package, AlertTriangle, CheckCircle } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPageFriendly() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) { setQuery(tokenParam); searchOrder(tokenParam); }
  }, []);

  const searchOrder = async (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true); setError(null); setOrder(null);
    try {
      let dbQuery = supabase.from('orders').select('*')
      if (searchTerm.length > 20) dbQuery = dbQuery.eq('tracking_token', searchTerm);
      else dbQuery = dbQuery.eq('customer->>idCard', searchTerm);
      
      const { data, error } = await dbQuery.single();
      if (error || !data) setError("Ups, no encontramos esa orden.");
      else setOrder(data);
    } catch (err) { setError("Error de conexión."); } finally { setLoading(false); }
  };

  // HELPERS
  const formatAccessories = (acc) => {
    if (!acc) return 'Ninguno';
    if (acc.general && typeof acc.general === 'string' && !acc.sim && !acc.charger) return acc.general;
    const list = [];
    if (acc.sim) list.push('Chip/SIM');
    if (acc.memoryCard) list.push('Memoria SD');
    if (acc.charger) list.push('Cargador');
    if (acc.case) list.push('Funda/Forro');
    if (acc.general) list.push(acc.general);
    return list.length > 0 ? list.join(', ') : 'Ninguno';
  }

  const getStatusProgress = (status) => {
    const map = { 'Recibido': 10, 'Diagnóstico': 30, 'Pendiente Repuesto': 50, 'En Reparación': 70, 'Listo para Entregar': 90, 'Entregado': 100, 'Cancelada': 100, 'Devuelto (No Reparado)': 100 };
    return map[status] || 10;
  };

  const getStatusColor = (status) => {
      if (status === 'Listo para Entregar' || status === 'Entregado') return 'bg-emerald-500';
      if (status === 'Cancelada' || status === 'Devuelto (No Reparado)') return 'bg-red-500';
      return 'bg-violet-600'; 
  };

  return (
    // FONDO MORADO VIBRANTE
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 flex flex-col items-center justify-center p-4 font-sans pb-20">
      
      {/* HEADER */}
      <div className="mb-8 text-center">
         <h1 className="text-4xl font-black text-white tracking-tighter mb-1 drop-shadow-md">TallerControl</h1>
         <p className="text-purple-200 font-medium tracking-widest uppercase text-xs">Rastreo de Servicio</p>
      </div>

      {/* --- PANTALLA DE BÚSQUEDA --- */}
      {!order && (
        <div className="relative w-full max-w-md group">
           {/* Borde Resplandeciente Estático */}
           <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-[2rem] blur opacity-75"></div>
           
           <div className="relative bg-white w-full rounded-[1.8rem] p-8 shadow-2xl">
               <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Hola! 👋</h2>
               <p className="text-gray-500 mb-6">Introduce tu cédula o escanea el QR.</p>
               
               <form onSubmit={(e) => {e.preventDefault(); searchOrder(query)}}>
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center mb-4 border-2 border-transparent focus-within:border-violet-500 transition-all">
                   <Search className="text-violet-400 ml-2" />
                   <input 
                     type="text" 
                     className="bg-transparent w-full p-2 outline-none text-gray-700 font-bold text-lg placeholder-gray-300"
                     placeholder="Cédula..."
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                   />
                 </div>
                 <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl transition-transform active:scale-95 shadow-lg shadow-violet-200">
                   {loading ? "Buscando..." : "Ver Estado"}
                 </button>
               </form>
               {error && <p className="mt-4 text-center text-red-500 font-bold text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
           </div>
        </div>
      )}

      {/* --- TARJETA DE RESULTADOS CON LUCES GIRATORIAS --- */}
      {order && (
        // Contenedor principal con padding para el borde
        <div className="relative w-full max-w-md p-[4px] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/40">
           
           {/* EFECTO DE LUCES GIRATORIAS (Conic Gradient Animado) */}
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#ff00ff_90deg,transparent_180deg,#00ffff_270deg,transparent_360deg)] animate-border-spin opacity-80"></div>
           
           {/* FONDO BLANCO DE LA TARJETA (Cubre el centro para dejar solo el borde) */}
           <div className="relative bg-white w-full h-full rounded-[2.3rem] overflow-hidden">
              
              {/* 1. ENCABEZADO */}
              <div className="bg-violet-50 p-8 pb-10 text-center border-b border-violet-100">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-violet-300/50 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${getStatusColor(order.status)}`} 
                        style={{ width: `${getStatusProgress(order.status)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium flex justify-between">
                      <span>Inicio</span>
                      <span>{getStatusProgress(order.status)}%</span>
                  </p>
              </div>

              {/* 2. CLIENTE */}
              <div className="px-8 -mt-6 relative z-10">
                 <div className="bg-white p-5 rounded-2xl shadow-lg shadow-violet-100 border border-white flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</p>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{order.customer?.firstName} {order.customer?.lastName}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                <Hash className="w-3 h-3 mr-1"/> {order.customer?.idCard}
                            </span>
                            <span className="flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                <Phone className="w-3 h-3 mr-1"/> {order.customer?.phone}
                            </span>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 space-y-6">
                  {/* 3. EQUIPO Y FALLA */}
                  <div className="flex gap-4">
                      <div className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <Smartphone className="w-6 h-6 text-blue-600 mb-2" />
                          <p className="text-xs font-bold text-blue-400 uppercase">Equipo</p>
                          <p className="font-bold text-gray-800">{order.device?.brand}</p>
                          <p className="text-xs text-gray-500">{order.device?.model}</p>
                      </div>
                      <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                          <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
                          <p className="text-xs font-bold text-amber-500 uppercase">Falla</p>
                          <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">"{order.problemDescription}"</p>
                      </div>
                  </div>

                  {/* 4. ACCESORIOS Y NOTAS */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="mb-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
                              <Package className="w-3 h-3" /> Accesorios
                          </p>
                          <p className="text-gray-700 font-medium text-sm">{formatAccessories(order.accessories)}</p>
                      </div>
                      
                      {order.internalNotes && (
                          <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
                                  <FileText className="w-3 h-3" /> Nota Taller
                              </p>
                              <p className="text-gray-600 italic text-sm">"{order.internalNotes}"</p>
                          </div>
                      )}
                  </div>

                  {/* 5. FOTOS */}
                  {order.photos?.length > 0 && (
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Evidencia (Toca para ver)
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                           {order.photos.map((p,i) => (
                              <button key={i} onClick={() => setSelectedPhoto(p)} className="shrink-0 focus:outline-none transform transition hover:scale-105">
                                 <img src={p} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md" />
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* 6. TOTAL */}
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-300 flex justify-between items-center">
                     <div>
                        <p className="text-violet-100 text-xs font-bold uppercase mb-1">Pendiente</p>
                        <p className="text-xs opacity-80">A pagar al retirar</p>
                     </div>
                     <p className="text-3xl font-black tracking-tight">${order.finance?.pendingBalance?.toFixed(2)}</p>
                  </div>
                  
                  <button onClick={() => setOrder(null)} className="w-full text-center text-violet-500 font-bold text-sm hover:underline pb-2">
                      Consultar otra orden
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL FOTO */}
      {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
              <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                  <X className="w-8 h-8" />
              </button>
              <img src={selectedPhoto} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()} />
          </div>
      )}

      {/* ESTILOS CSS EXTRA (Animación de rotación) */}
      <style jsx global>{`
        @keyframes border-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-border-spin {
            animation: border-spin 4s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}