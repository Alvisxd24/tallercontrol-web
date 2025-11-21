import { useState, useEffect } from 'react'
import { Search, Smartphone, Zap, Calendar, User, DollarSign, Camera } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TrackPageFriendly() {
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
      if (error || !data) setError("Ups, no encontramos esa orden.");
      else setOrder(data);
    } catch (err) { setError("Error de conexión."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 font-sans">
      
      <h1 className="text-white text-3xl font-bold mb-8 tracking-tight">TallerControl</h1>

      {!order ? (
        <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-indigo-900/50">
           <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Hola! 👋</h2>
           <p className="text-gray-500 mb-6">Introduce tu cédula o código para ver como va tu equipo.</p>
           
           <form onSubmit={(e) => {e.preventDefault(); searchOrder(query)}}>
             <div className="bg-gray-100 p-2 rounded-2xl flex items-center mb-4 border-2 border-transparent focus-within:border-indigo-500 transition-colors">
               <Search className="text-gray-400 ml-2" />
               <input 
                 type="text" 
                 className="bg-transparent w-full p-2 outline-none text-gray-700 font-medium"
                 placeholder="Ej: 12345..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
             </div>
             <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-transform active:scale-95">
               {loading ? "Buscando..." : "Ver Estado"}
             </button>
           </form>
           {error && <p className="mt-4 text-center text-red-500 font-bold text-sm">{error}</p>}
        </div>
      ) : (
        <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/50 animate-fade-in-up">
           {/* TOP BANNER */}
           <div className="bg-indigo-500 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                Estado
              </div>
              <h2 className="text-4xl font-black tracking-tight">{order.status}</h2>
           </div>

           <div className="p-8 space-y-6">
              {/* CLIENTE */}
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Propietario</p>
                    <p className="text-lg font-bold text-gray-800">{order.customer?.firstName}</p>
                 </div>
              </div>

              {/* EQUIPO */}
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <Smartphone className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Dispositivo</p>
                    <p className="text-lg font-bold text-gray-800">{order.device?.brand} {order.device?.model}</p>
                 </div>
              </div>

              {/* INFO EXTRA */}
              <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 leading-relaxed border border-gray-100">
                 <p className="font-bold text-gray-800 mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Diagnóstico:</p>
                 "{order.problemDescription}"
              </div>

              {/* FOTOS */}
              {order.photos?.length > 0 && (
                 <div className="flex -space-x-4 overflow-hidden py-2">
                    {order.photos.map((p,i) => (
                       <img key={i} src={p} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                    ))}
                    <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                       +{order.photos.length}
                    </div>
                 </div>
              )}

              {/* COSTO */}
              <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                 <span className="text-gray-400 font-medium">Total Restante</span>
                 <span className="text-3xl font-black text-indigo-600">${order.finance?.pendingBalance?.toFixed(2)}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}