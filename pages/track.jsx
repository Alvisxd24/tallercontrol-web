import { useState, useEffect } from 'react'
import { Search, Smartphone, Zap, User, Camera, X, Phone, Hash, FileText, Package, AlertTriangle, Check, Store } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPageFriendly() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [shopName, setShopName] = useState('') // Nombre del taller específico
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
    setLoading(true); setError(null); setOrder(null); setShopName('');
    try {
      let dbQuery = supabase.from('orders').select('*')
      if (searchTerm.length > 20) dbQuery = dbQuery.eq('tracking_token', searchTerm);
      else dbQuery = dbQuery.eq('customer->>idCard', searchTerm);
      
      const { data, error } = await dbQuery.single();
      
      if (error || !data) {
          setError("Ups, no encontramos esa orden.");
      } else {
          setOrder(data);
          // --- BUSCAR NOMBRE DEL TALLER ---
          if (data.user_id) {
              const { data: settingsData } = await supabase
                  .from('settings')
                  .select('shopName')
                  .eq('user_id', data.user_id)
                  .single();
              
              if (settingsData && settingsData.shopName) {
                  setShopName(settingsData.shopName);
              }
          }
      }
    } catch (err) { setError("Error de conexión."); } finally { setLoading(false); }
  };

  // --- HELPER: BARRA DE PROGRESO (CHECKLIST) ---
  const renderStepper = (currentStatus) => {
      const steps = ['Recibido', 'Diagnóstico', 'En Reparación', 'Listo para Entregar', 'Entregado'];
      
      let activeIndex = steps.indexOf(currentStatus);
      if (currentStatus === 'Pendiente Repuesto') activeIndex = 1;
      if (currentStatus === 'Listo') activeIndex = 3;
      if (activeIndex === -1 && (currentStatus === 'Cancelada' || currentStatus === 'Devuelto (No Reparado)')) activeIndex = 0;

      return (
          <div className="flex items-center justify-between w-full px-2 mt-4 mb-6 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 rounded-full"></div>
              <div 
                  className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, index) => {
                  const isCompleted = index <= activeIndex;
                  const isCurrent = index === activeIndex;

                  return (
                      <div key={step} className="flex flex-col items-center group relative z-10">
                          <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                              ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-300' : 'bg-white border-gray-300 text-gray-300'}
                              ${isCurrent ? 'scale-125 ring-4 ring-emerald-100' : ''}
                          `}>
                              {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <div className="w-2 h-2 bg-gray-200 rounded-full"></div>}
                          </div>
                          <span className={`
                              absolute -bottom-8 text-[9px] font-bold uppercase tracking-wider text-center w-20
                              ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                              ${isCurrent ? 'opacity-100 scale-110' : 'opacity-0 md:opacity-100'}
                              transition-all
                          `}>
                              {step.replace(' para Entregar', '')}
                          </span>
                      </div>
                  );
              })}
          </div>
      );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 flex flex-col items-center justify-center p-4 font-sans pb-24">
      
      {/* HEADER APP: SIEMPRE DICE "TALLERCONTROL" */}
      <div className="mb-8 text-center">
         <h1 className="text-4xl font-black text-white tracking-tighter mb-1 drop-shadow-lg">
             TallerControl
         </h1>
         <p className="text-purple-200 font-medium tracking-widest uppercase text-xs opacity-80">
             Plataforma de Rastreo
         </p>
      </div>

      {/* --- BÚSQUEDA --- */}
      {!order && (
        <div className="relative w-full max-w-md group">
           <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-white rounded-[2rem] blur opacity-60 animate-pulse"></div>
           <div className="relative bg-white w-full rounded-[1.8rem] p-8 shadow-2xl">
               <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
               <p className="text-gray-500 mb-6">Consulta el estado de tu equipo aquí.</p>
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
                 <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl transition-transform active:scale-95 shadow-lg">
                   {loading ? "Buscando..." : "Rastrear"}
                 </button>
               </form>
               {error && <p className="mt-4 text-center text-red-500 font-bold text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
           </div>
        </div>
      )}

      {/* --- TARJETA DE RESULTADOS --- */}
      {order && (
        <div className="relative w-full max-w-md group animate-fade-in-up">
           
           {/* LUCES GIRATORIAS */}
           <div className="absolute -inset-[6px] rounded-[2.5rem] overflow-hidden">
               <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#FFFF00_90deg,transparent_180deg,#00FFFF_270deg,#FFFFFF_360deg)] animate-border-spin opacity-100"></div>
           </div>
           
           {/* FONDO TARJETA */}
           <div className="relative bg-white w-full h-full rounded-[2.2rem] overflow-hidden shadow-2xl">
              
              {/* ENCABEZADO CON NOMBRE DEL TALLER (NEGRO) */}
              <div className="bg-slate-900 p-4 text-center border-b border-slate-800">
                  <div className="inline-flex items-center gap-2 text-white/90">
                      <Store className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-sm tracking-wide uppercase">
                          {shopName || 'SERVICIO TÉCNICO'}
                      </span>
                  </div>
              </div>

              {/* ESTADO Y CHECKLIST */}
              <div className="bg-slate-50 p-6 pb-8 border-b border-gray-100 text-center">
                  <h2 className="text-2xl font-black text-slate-800 mb-6">{order.status}</h2>
                  {renderStepper(order.status)}
                  <div className="h-4"></div>
              </div>

              {/* INFO CLIENTE */}
              <div className="px-6 -mt-6 relative z-10">
                 <div className="bg-white p-5 rounded-2xl shadow-lg shadow-indigo-100 border border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
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

              {/* DETALLES */}
              <div className="p-6 space-y-5">
                  <div className="flex gap-3">
                      <div className="flex-1 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                          <Smartphone className="w-5 h-5 text-indigo-500 mb-2" />
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">Equipo</p>
                          <p className="font-bold text-gray-800 text-sm">{order.device?.brand}</p>
                          <p className="text-xs text-gray-500">{order.device?.model}</p>
                      </div>
                      <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
                          <p className="text-[10px] font-bold text-amber-600 uppercase">Falla</p>
                          <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">"{order.problemDescription}"</p>
                      </div>
                  </div>

                  {/* Accesorios y Notas */}
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

                  {/* Fotos */}
                  {order.photos?.length > 0 && (
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Evidencia (Toca para ampliar)
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                           {order.photos.map((p,i) => (
                              <button key={i} onClick={() => setSelectedPhoto(p)} className="shrink-0 focus:outline-none transform transition hover:scale-105 active:scale-95">
                                 <img src={p} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Total */}
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl flex justify-between items-center">
                     <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">Saldo Pendiente</p>
                        <p className="text-slate-500 text-[10px]">Al retirar</p>
                     </div>
                     <p className="text-2xl font-black tracking-tight">${order.finance?.pendingBalance?.toFixed(2)}</p>
                  </div>
                  
                  <button onClick={() => {setOrder(null); setShopName('');}} className="w-full text-center text-indigo-500 font-bold text-sm hover:underline pb-2">
                      Consultar otra orden
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL FOTO */}
      {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
              <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
                  <X className="w-6 h-6" />
              </button>
              <img src={selectedPhoto} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-2 border-white/10" onClick={(e) => e.stopPropagation()} />
          </div>
      )}

      {/* ESTILOS CSS EXTRA (Animación de rotación) */}
      <style jsx global>{`
        @keyframes border-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-border-spin {
            animation: border-spin 3s linear infinite; /* Más rápido (3s) para que se note más */
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}