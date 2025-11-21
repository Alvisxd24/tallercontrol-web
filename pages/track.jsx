// pages/track.jsx

import { useState, useEffect } from 'react'
import { Search, Smartphone, CheckCircle, Wrench, Package, Box, User, AlertTriangle, CreditCard, ChevronRight, Camera, FileText, Phone, Hash } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPage() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setQuery(tokenParam);
      searchOrder(tokenParam);
    }
  }, []);

  const searchOrder = async (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true); setError(null); setOrder(null);

    try {
      let dbQuery = supabase.from('orders').select('*')
      if (searchTerm.length > 20) {
          dbQuery = dbQuery.eq('tracking_token', searchTerm);
      } else {
          dbQuery = dbQuery.eq('customer->>idCard', searchTerm); 
      }

      const { data, error } = await dbQuery.single();

      if (error || !data) {
        setError("No encontramos una orden activa con esos datos.");
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); searchOrder(query); }

  const getStatusInfo = (status) => {
    const steps = ['Recibido', 'Diagnóstico', 'En Reparación', 'Listo', 'Entregado'];
    const mapIdx = {
      'Recibido': 0, 'Diagnóstico': 1, 'Pendiente Repuesto': 2, 
      'En Reparación': 2, 'Listo para Entregar': 3, 'Entregado': 4,
      'Devuelto (No Reparado)': 4, 'Cancelada': 4
    };
    return { steps, currentIdx: mapIdx[status] || 0 };
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

  return (
    <div className="min-h-screen font-sans text-slate-800 relative">
      <div className="premium-gradient-bg"></div>

      <main className="max-w-lg mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/50">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TallerControl</h1>
          </div>
          
          <div className="glass-card rounded-2xl p-2 flex items-center mt-4">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cédula o escanea el QR"
              className="bg-transparent border-none w-full px-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"/> : <Search className="w-5 h-5" />}
            </button>
          </div>
          
          {error && (
             <div className="mt-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-100 p-3 rounded-xl text-sm font-medium">
               {error}
             </div>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in-up pb-6">
            <div className="bg-slate-50 p-8 pb-12 border-b border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-10 -mt-10 blur-3xl opacity-50"></div>
               <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Estado Actual</p>
               <h2 className="text-center text-3xl font-black text-slate-800 mb-6">{order.status}</h2>
               
               <div className="flex justify-between items-center relative px-2">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-0 rounded-full"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-0 rounded-full transition-all duration-1000"
                    style={{ width: `${getStatusInfo(order.status).currentIdx * 25}%` }}
                  ></div>
                  {getStatusInfo(order.status).steps.map((step, idx) => {
                    const isActive = idx <= getStatusInfo(order.status).currentIdx;
                    return (
                      <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-blue-500 border-white shadow-lg shadow-blue-500/40 scale-110' : 'bg-slate-200 border-white'}`}>
                         {isActive && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    )
                  })}
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide"><span>Inicio</span><span>Fin</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 -mt-6 relative z-10">
              <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-blue-400 uppercase">Cliente</span>
                </div>
                <p className="font-bold text-slate-800 text-lg leading-tight mb-2">{order.customer?.firstName} {order.customer?.lastName}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Hash className="w-3 h-3 text-slate-300" /><span>{order.customer?.idCard}</span></div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Phone className="w-3 h-3 text-slate-300" /><span>{order.customer?.phone}</span></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><Smartphone className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-violet-400 uppercase">Equipo</span>
                </div>
                <p className="font-bold text-slate-800 text-lg leading-tight mb-1">{order.device?.model}</p>
                <p className="text-sm text-slate-500 font-medium">{order.device?.brand} • {order.device?.color}</p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 space-y-4">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><Package className="w-3 h-3" /> Accesorios</p>
                      <p className="text-slate-700 font-medium text-sm">{formatAccessories(order.accessories)}</p>
                  </div>
                  {order.internalNotes && (
                      <div className="pt-3 border-t border-slate-200">
                           <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><FileText className="w-3 h-3" /> Obs. Taller</p>
                          <p className="text-slate-600 italic text-sm leading-relaxed">"{order.internalNotes}"</p>
                      </div>
                  )}
              </div>

              <div className="bg-amber-50 p-5 rounded-[1.5rem] border border-amber-100">
                 <div className="flex items-center gap-2 mb-2 text-amber-600"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-bold uppercase">Falla Reportada</span></div>
                 <p className="text-amber-900/80 text-sm font-medium leading-relaxed">"{order.problemDescription}"</p>
              </div>

              {order.photos && order.photos.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Camera className="w-4 h-4" /> Evidencia</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {order.photos.map((pic, i) => (
                      <a key={i} href={pic} target="_blank" className="flex-shrink-0">
                         <img src={pic} className="w-20 h-20 rounded-xl object-cover shadow-sm border border-slate-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mx-6 mt-2 p-5 bg-slate-900 rounded-3xl text-white flex justify-between items-center shadow-xl shadow-slate-900/20">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/10 rounded-full"><CreditCard className="w-5 h-5 text-white"/></div>
                 <div><p className="text-xs text-slate-400 font-bold uppercase">Saldo Pendiente</p><p className="text-xs text-slate-500">Total a pagar</p></div>
               </div>
               <p className="text-2xl font-black tracking-tight">${order.finance?.pendingBalance?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}