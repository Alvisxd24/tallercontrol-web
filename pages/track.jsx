import { useState, useEffect } from 'react'
import { Search, Smartphone, Check, MapPin, ArrowRight, Camera, User } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPageSwiss() {
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
      if (error || !data) setError("Orden no encontrada.");
      else setOrder(data);
    } catch (err) { setError("Error de conexión."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans">
      
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">TallerControl</span>
          <span className="text-xs font-medium text-gray-500">Soporte Técnico</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-16">
        
        {!order && (
          <div className="text-center py-10">
            <h1 className="text-4xl font-semibold mb-4 tracking-tight">Rastrea tu servicio.</h1>
            <p className="text-gray-500 text-lg mb-10">Consulta el estado de reparación de tu dispositivo al instante.</p>
            
            <form onSubmit={(e) => {e.preventDefault(); searchOrder(query)}} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="N° de Orden o Cédula"
                className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-5 pr-12 text-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="absolute right-3 top-3 bottom-3 bg-black text-white w-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
            {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
          </div>
        )}

        {order && (
          <div className="animate-fade-in">
            {/* ESTADO GRANDE */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-semibold mb-2 tracking-tight">{order.status}</h2>
              <p className="text-gray-500">Última actualización: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>

            {/* INFO LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Cliente</span>
                <span className="font-semibold">{order.customer?.firstName} {order.customer?.lastName}</span>
              </div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Dispositivo</span>
                <span className="font-semibold">{order.device?.brand} {order.device?.model}</span>
              </div>
              <div className="p-6 border-b border-gray-100">
                <span className="text-gray-500 font-medium block mb-2">Diagnóstico</span>
                <span className="font-medium text-gray-800 leading-relaxed">{order.problemDescription}</span>
              </div>
              {order.photos?.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                   <span className="text-gray-500 font-medium block mb-3">Fotos</span>
                   <div className="flex gap-2">
                      {order.photos.map((p,i) => <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover border border-gray-200"/>)}
                   </div>
                </div>
              )}
              <div className="p-6 bg-gray-50 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Saldo Pendiente</span>
                <span className="font-bold text-2xl">${order.finance?.pendingBalance?.toFixed(2)}</span>
              </div>
            </div>
            
            <button onClick={() => setOrder(null)} className="mt-8 text-blue-600 font-medium hover:underline w-full text-center">
              Consultar otra orden
            </button>
          </div>
        )}
      </main>
    </div>
  )
}