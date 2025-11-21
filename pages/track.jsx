import { useState, useEffect } from 'react'
import { Search, Smartphone, CheckCircle, Wrench, Package, User, AlertTriangle, CreditCard, Camera, FileText, Hash, Phone, Cpu } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPageDark() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      if (error || !data) setError("No encontramos esa orden.");
      else setOrder(data);
    } catch (err) { setError("Error de conexión."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-6 h-6" />
            <span className="text-xl font-bold tracking-wider text-white">TALLER<span className="text-cyan-400">CONTROL</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* BUSCADOR */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Rastreo de Reparación</h1>
          <p className="text-slate-400 mb-6">Ingresa tu código para ver el estado en tiempo real.</p>
          
          <form onSubmit={(e) => {e.preventDefault(); searchOrder(query)}} className="relative max-w-md mx-auto">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cédula o Código..."
              className="w-full bg-slate-900 border border-slate-700 rounded-full py-4 pl-6 pr-14 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
              {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : <Search className="w-5 h-5" />}
            </button>
          </form>
          {error && <p className="mt-4 text-red-400 bg-red-900/20 py-2 px-4 rounded-lg inline-block border border-red-900">{error}</p>}
        </div>

        {order && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* ESTATUS PRINCIPAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Estado Actual</p>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight">{order.status}</h2>
              
              {/* Barra de Progreso Simple */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ width: order.status === 'Entregado' ? '100%' : '60%' }}></div>
              </div>
            </div>

            {/* GRID INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 text-cyan-400">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold uppercase text-sm">Cliente</h3>
                </div>
                <p className="text-xl font-bold text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
                <p className="text-slate-400 text-sm mt-1">{order.customer?.idCard}</p>
              </div>

              {/* Equipo */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 text-purple-400">
                  <Smartphone className="w-5 h-5" />
                  <h3 className="font-bold uppercase text-sm">Dispositivo</h3>
                </div>
                <p className="text-xl font-bold text-white">{order.device?.brand} {order.device?.model}</p>
                <p className="text-slate-400 text-sm mt-1">{order.device?.color}</p>
              </div>
            </div>

            {/* FALLA */}
            <div className="bg-slate-900 border-l-4 border-yellow-500 p-6 rounded-r-2xl shadow-lg">
              <h3 className="text-yellow-500 font-bold uppercase text-xs mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Falla Reportada</h3>
              <p className="text-slate-300 leading-relaxed">"{order.problemDescription}"</p>
            </div>

            {/* FOTOS */}
            {order.photos?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 font-bold uppercase text-xs mb-4">Evidencia</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.photos.map((pic, i) => (
                    <img key={i} src={pic} className="w-24 h-24 object-cover rounded-lg border border-slate-700 hover:border-cyan-500 transition-all" />
                  ))}
                </div>
              </div>
            )}

            {/* TOTAL */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-2xl flex justify-between items-center text-white shadow-xl shadow-cyan-900/20">
              <div>
                <p className="text-cyan-100 text-xs font-bold uppercase">Saldo Pendiente</p>
                <p className="text-xs opacity-80">A pagar al retirar</p>
              </div>
              <p className="text-3xl font-black">${order.finance?.pendingBalance?.toFixed(2)}</p>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}