import { useEffect, useState } from "react";

export default function TrackPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const trackingId = searchParams.get("id");

    if (!trackingId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const url =
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders` +
          `?public_tracking_id=eq.${trackingId}&select=*`;

        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        });

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrder(data[0]);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (notFound) return <p>Orden no encontrada</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Seguimiento de Orden #{order.id}</h1>
      <p><b>Estado:</b> {order.status}</p>
      <p><b>Cliente:</b> {order.customer?.firstName} {order.customer?.lastName}</p>
      <p><b>Dispositivo:</b> {order.device?.brand} {order.device?.model}</p>
      <p><b>Fecha:</b> {order.createdAt}</p>
      <p><b>Problema:</b> {order.problemDescription}</p>
    </div>
  );
}
