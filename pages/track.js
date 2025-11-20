import { useEffect, useState } from "react";

export default function TrackPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");

        if (!id) {
            setError("No se proporcionó un ID de seguimiento.");
            setLoading(false);
            return;
        }

        fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?public_tracking_id=eq.${id}&select=*`,
            {
                headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (!data || data.length === 0) {
                    setError("Orden no encontrada.");
                } else {
                    setOrder(data[0]);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Error al conectar con el servidor.");
                setLoading(false);
            });
    }, []);

    if (loading)
        return <p style={{ padding: 20, fontSize: 18 }}>Cargando...</p>;

    if (error)
        return (
            <div style={{ padding: 20, fontSize: 18, color: "red" }}>
                ❌ {error}
            </div>
        );

    // === ESTILOS DE LA PÁGINA ===
    const styles = {
        container: {
            maxWidth: 600,
            margin: "0 auto",
            padding: 20,
            fontFamily: "Arial, sans-serif",
            color: "#222",
        },
        card: {
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 10,
        },
        statusBadge: {
            padding: "6px 14px",
            borderRadius: 20,
            fontWeight: "bold",
            display: "inline-block",
            color: "#fff",
        },
        photo: {
            width: "100%",
            maxWidth: "150px",
            borderRadius: 8,
            marginRight: 10,
            marginBottom: 10,
            border: "1px solid #ddd",
        },
    };

    // === COLORES DEL STATUS ===
    const statusColors = {
        "EN REPARACIÓN": "#ff9800",
        "LISTO PARA ENTREGAR": "#2196f3",
        "ENTREGADO": "#4caf50",
        "PENDIENTE": "#9c27b0",
    };

    const statusColor =
        statusColors[order.status] || "#333";

    // ==== GALERÍA DE FOTOS ====
    const photos = order.photos ? JSON.parse(order.photos) : [];

    return (
        <div style={styles.container}>
            <h1 style={{ textAlign: "center", marginBottom: 20 }}>
                🔧 Seguimiento de Orden
            </h1>

            <div style={styles.card}>
                <span
                    style={{
                        ...styles.statusBadge,
                        background: statusColor,
                    }}
                >
                    {order.status}
                </span>

                <h2 style={{ marginTop: 15 }}>
                    Orden #{order.id}
                </h2>

                <p>
                    <strong>Fecha de recepción:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>

            {/* CLIENTE */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>👤 Cliente</h3>
                <p>
                    <strong>Nombre:</strong>{" "}
                    {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p>
                    <strong>Teléfono:</strong>{" "}
                    {order.customer?.phone}
                </p>
                <p>
                    <strong>Cédula / ID:</strong>{" "}
                    {order.customer?.idCard}
                </p>
            </div>

            {/* EQUIPO */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>📱 Equipo</h3>
                <p>
                    <strong>Modelo:</strong>{" "}
                    {order.device?.brand} {order.device?.model}
                </p>
                <p>
                    <strong>Color:</strong> {order.device?.color}
                </p>
                <p>
                    <strong>Contraseña:</strong>{" "}
                    {order.device?.password || "No registrada"}
                </p>
            </div>

            {/* DETALLES */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>🛠 Falla Reportada</h3>
                <p>{order.problemDescription}</p>
            </div>

            {/* FOTOS */}
            {photos.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>📸 Fotos del Equipo</h3>

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {photos.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                style={styles.photo}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* FINANZAS */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>💰 Estado de Pago</h3>
                <p>
                    <strong>Costo total:</strong> $
                    {order.finance?.repairCost}
                </p>
                <p>
                    <strong>Abonado:</strong> $
                    {order.finance?.deposit}
                </p>
                <p>
                    <strong>Restante:</strong>{" "}
                    <strong style={{ color: "red" }}>
                        ${order.finance?.pendingBalance}
                    </strong>
                </p>
            </div>

            <p style={{ textAlign: "center", marginTop: 30 }}>
                ✔ Página generada por TallerControl
            </p>
        </div>
    );
}
