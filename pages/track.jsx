"use client";
import { useEffect, useState } from "react";

export default function TrackPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const statusSteps = [
        { key: "PENDIENTE", label: "Recibido" },
        { key: "DIAGNOSTICO", label: "Diagnóstico" },
        { key: "REPARACION", label: "Reparación" },
        { key: "PRUEBA", label: "Pruebas" },
        { key: "LISTO", label: "Listo para entregar" },
        { key: "ENTREGADO", label: "Entregado" },
    ];

    const getStepIndex = (status) =>
        statusSteps.findIndex(s => s.key === status.toUpperCase());

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const trackingId = params.get("id");

        if (!trackingId) {
            setErrorMsg("ID de seguimiento inválido.");
            setLoading(false);
            return;
        }

        fetch(
            `${SUPABASE_URL}/rest/v1/orders?public_tracking_id=eq.${trackingId}&select=*`,
            {
                headers: {
                    apikey: SUPABASE_ANON,
                    Authorization: `Bearer ${SUPABASE_ANON}`,
                },
            }
        )
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    setErrorMsg("Orden no encontrada.");
                } else {
                    setOrder(data[0]);
                }
            })
            .catch(() => setErrorMsg("Error cargando la orden."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;
    if (errorMsg) return <p style={{ padding: 20, color: "red" }}>❌ {errorMsg}</p>;

    const stepIndex = getStepIndex(order.status);
    const customer = JSON.parse(order.customer || "{}");
    const device = JSON.parse(order.device || "{}");
    const finance = JSON.parse(order.finance || "{}");
    const accessories = JSON.parse(order.accessories || "{}");
    const photos = order.photos ? order.photos.split(",") : [];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>📦 Seguimiento de Orden</h1>
                <p style={styles.orderId}>ID de seguimiento: <b>{order.public_tracking_id}</b></p>
                <p style={styles.date}>Fecha de recepción: <b>{order.createdAt?.split("T")[0]}</b></p>

                {/* PROGRESO */}
                <h2 style={styles.sectionTitle}>Progreso</h2>
                <div style={styles.progressContainer}>
                    {statusSteps.map((step, index) => (
                        <div key={index} style={styles.progressStep}>
                            <div
                                style={{
                                    ...styles.circle,
                                    background:
                                        index <= stepIndex ? "#1abc9c" : "#dfe6e9",
                                }}
                            >
                                {index + 1}
                            </div>
                            <p style={styles.stepLabel}>{step.label}</p>
                        </div>
                    ))}
                </div>

                {/* INFO CLIENTE */}
                <h2 style={styles.sectionTitle}>Cliente</h2>
                <div style={styles.infoBox}>
                    <p><b>Nombre:</b> {customer.firstName} {customer.lastName}</p>
                    <p><b>Cédula:</b> {customer.idCard}</p>
                    <p><b>Teléfono:</b> {customer.phone}</p>
                    <p><b>Dirección:</b> {customer.address}</p>
                </div>

                {/* INFO EQUIPO */}
                <h2 style={styles.sectionTitle}>Equipo</h2>
                <div style={styles.infoBox}>
                    <p><b>Modelo:</b> {device.brand} {device.model}</p>
                    <p><b>Color:</b> {device.color}</p>
                    <p><b>Clave / Patrón:</b> {device.password}</p>
                    <p><b>Falla reportada:</b> {order.problemDescription}</p>
                </div>

                {/* ACCESORIOS */}
                <h2 style={styles.sectionTitle}>Accesorios</h2>
                <div style={styles.infoBox}>
                    <p>
                        {JSON.stringify(accessories, null, 2)
                            .replace(/[\{\}"]/g, "")
                            .replace(/:/g, ": ")}
                    </p>
                </div>

                {/* FINANZAS */}
                <h2 style={styles.sectionTitle}>Finanzas</h2>
                <div style={styles.infoBox}>
                    <p><b>Costo total:</b> ${finance.repairCost}</p>
                    <p><b>Abono:</b> ${finance.deposit}</p>
                    <p><b>Pendiente:</b> ${finance.pendingBalance}</p>
                </div>

                {/* FOTOS */}
                <h2 style={styles.sectionTitle}>Fotos del Equipo</h2>
                <div style={styles.photoGrid}>
                    {photos.length === 0 && <p>No hay fotos registradas.</p>}
                    {photos.map((p, i) => (
                        <img key={i} src={p} style={styles.photo} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "#f5f6fa",
        minHeight: "100vh",
        padding: 20,
        display: "flex",
        justifyContent: "center",
    },
    card: {
        background: "#fff",
        width: "100%",
        maxWidth: 600,
        padding: 25,
        borderRadius: 15,
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    },
    title: {
        textAlign: "center",
        color: "#2d3436",
    },
    sectionTitle: {
        marginTop: 20,
        color: "#0984e3",
    },
    orderId: {
        fontSize: 14,
        color: "#636e72",
    },
    date: {
        fontSize: 14,
        color: "#636e72",
    },
    infoBox: {
        background: "#f1f2f6",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    progressContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    progressStep: {
        textAlign: "center",
        width: "16%",
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontWeight: "bold",
        margin: "0 auto",
    },
    stepLabel: {
        fontSize: 10,
        marginTop: 5,
    },
    photoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
    },
    photo: {
        width: "100%",
        borderRadius: 10,
        border: "1px solid #ccc",
    },
};
