// pages/track.js
import { useEffect, useState } from 'react';

export default function TrackPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");

        if (!id) {
            setError("No se proporcionó un ID de seguimiento.");
            setLoading(false);
            return;
        }

        console.log("ID recibido:", id);

        fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?public_tracking_id=eq.${id}&select=*`,
            {
                headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {
                console.log("Respuesta Supabase:", data);

                if (data.length === 0) {
                    setError("Orden no encontrada.");
                } else {
                    setOrder(data[0]);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("Error:", err);
                setError("Error al conectar con Supabase");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Seguimiento de Orden</h1>
            <h2>Orden #{order.id}</h2>
            <p><strong>Cliente:</strong> {order.customer.firstName} {order.customer.lastName}</p>
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Descripción:</strong> {order.problemDescription}</p>
        </div>
    );
}
