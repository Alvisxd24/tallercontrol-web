<<<<<<< HEAD
import { useEffect, useState } from "react";

export default function TrackPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const trackingId = url.searchParams.get("oid");

    if (!trackingId) return;

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    fetch(`${SUPABASE_URL}/rest/v1/orders?public_tracking_id=eq.${trackingId}&select=*`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        })
    
      .then(res => res.json())
      .then(data => {
        setOrder(data[0] || null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (!order) return <p>Orden no encontrada</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Seguimiento de Orden</h1>
      <h2>Orden #{order.id}</h2>

      <p><strong>Cliente:</strong> {order.customer.firstName} {order.customer.lastName}</p>
      <p><strong>Equipo:</strong> {order.device.brand} {order.device.model}</p>
      <p><strong>Estado:</strong> {order.status}</p>

      <h3>Fotos del Equipo</h3>
      {(order.photos || []).map((url) => (
        <img key={url} src={url} width="150" style={{ margin: 10 }} />
      ))}
    </div>
  );
}
=======
import { useEffect, useState } from "react";

export default function TrackPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const trackingId = url.searchParams.get("oid");

    if (!trackingId) return;

    fetch(`https://YOUR_SUPABASE_URL/rest/v1/orders?public_tracking_id=eq.${trackingId}&select=*`, {
      headers: {
        apikey: "YOUR_PUBLIC_ANON_KEY",
        Authorization: "Bearer YOUR_PUBLIC_ANON_KEY"
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data[0] || null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (!order) return <p>Orden no encontrada</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Seguimiento de Orden</h1>
      <h2>Orden #{order.id}</h2>

      <p><strong>Cliente:</strong> {order.customer.firstName} {order.customer.lastName}</p>
      <p><strong>Equipo:</strong> {order.device.brand} {order.device.model}</p>
      <p><strong>Estado:</strong> {order.status}</p>

      <h3>Fotos del Equipo</h3>
      {(order.photos || []).map((url) => (
        <img key={url} src={url} width="150" style={{ margin: 10 }} />
      ))}
    </div>
  );
}
>>>>>>> f3440bb63c478ac66bb341a14b58167aa3ee01fb
