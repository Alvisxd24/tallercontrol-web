import { useEffect, useState } from 'react';

export default function Track() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const trackingId =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null;

    useEffect(() => {
        if (!trackingId) return;

        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?public_tracking_id=eq.${trackingId}&select=*`;

        fetch(url, {
            headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setOrder(data[0] || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [trackingId]);

    if (!trackingId) {
        return <div style={{ padding: 20 }}><h2>Falta el ID en la URL</h2></div>;
    }

    if (loading) return <div style={{ padding: 20 }}><h2>Cargando...</h2></div>;
    if (!order) return <div style={{ padding: 20 }}><h2>Orden no encontrada</h2></div>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Seguimiento de Reparación</h1>
            <h2>Orden #{order.id}</h2>

            <p><strong>Cliente:</strong> {order.customer?.firstName} {order.customer?.lastName}</p>
            <p><strong>Teléfono:</strong> {order.customer?.phone}</p>

            <h3>Datos del Equipo</h3>
            <p><strong>Marca:</strong> {order.device?.brand}</p>
            <p><strong>Modelo:</strong> {order.device?.model}</p>
            <p><strong>Problema:</strong> {order.problemDescr}</p>

            <h3>Estado actual</h3>
            <p><strong>Status:</strong> {order.status}</p>

            {order.photos && order.photos.length > 0 && (
                <>
                    <h3>Fotos del Equipo</h3>
                    {order.photos.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            style={{ width: "100%", maxWidth: 300, marginBottom: 10, borderRadius: 8 }}
                        />
                    ))}
                </>
            )}

            <p style={{ marginTop: 30, opacity: 0.6 }}>
                Página generada por TallerControl ©
            </p>
        </div>
    );
}
