import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MembershipStatus.css";
import { supabase } from "../../supabaseClient"; 
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiDollarSign } from "react-icons/fi";

const MembershipStatus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Estados para la data real
  const [isUserActive, setIsUserActive] = useState(false);
  const [ultimoPago, setUltimoPago] = useState(0);
  const [fechaUltimoPago, setFechaUltimoPago] = useState("--/--/----");
  const [fechaVencimiento, setFechaVencimiento] = useState("--/--/----");
  const [porcentajeConsumido, setPorcentajeConsumido] = useState(0);
  const [historialPagos, setHistorialPagos] = useState([]);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData?.session) {
          navigate("/login");
          return;
        }

        const userId = authData.session.user.id;

        // 1. Verificamos si está habilitado (enabled)
        const { data: userData } = await supabase
          .from('users')
          .select('enabled')
          .eq('id', userId)
          .single();

        const activo = userData?.enabled === true || String(userData?.enabled).toLowerCase() === "true";
        setIsUserActive(activo);

        // 2. Buscamos la suscripción actual para ver el vencimiento
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('start_date, due_date')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subData && subData.start_date && subData.due_date) {
          const inicio = new Date(subData.start_date);
          const vencimiento = new Date(subData.due_date);
          const hoy = new Date();
          
          setFechaVencimiento(vencimiento.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }));

          // Calculamos el porcentaje de días consumidos
          const duracionTotal = vencimiento.getTime() - inicio.getTime();
          const consumido = hoy.getTime() - inicio.getTime();
          let porcentaje = duracionTotal > 0 ? (consumido / duracionTotal) * 100 : 0;
          
          // Limitamos el porcentaje entre 0 y 100
          if (porcentaje < 0) porcentaje = 0;
          if (porcentaje > 100) porcentaje = 100;
          
          setPorcentajeConsumido(Math.round(porcentaje));
        }

        // 3. Buscamos el historial de pagos de la tabla 'payments'
        const { data: pagosData } = await supabase
          .from('payments')
          .select('amount, payment_date, status')
          .eq('user_id', userId)
          .order('payment_date', { ascending: false })
          .limit(10); // Traemos los últimos 10 pagos

        if (pagosData && pagosData.length > 0) {
          setHistorialPagos(pagosData);
          setUltimoPago(pagosData[0].amount);
          
          const d = new Date(pagosData[0].payment_date);
          setFechaUltimoPago(d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando los datos de suscripción:", err);
        navigate("/login");
      }
    };

    fetchMembershipData();
  }, [navigate]);

  // Pantalla de carga mientras se busca la info en la base de datos
  if (isLoading) {
    return (
      <div className="dashboard-container membership-wrapper">
        <header className="dashboard-header fade-in">
          <p className="greeting">Verificando suscripción...</p>
        </header>
      </div>
    );
  }

  // Clases dinámicas basadas en el estado Activo/Inactivo
  const estadoClaseCSS = isUserActive ? "pagada" : "vencida";
  const textoEstado = isUserActive ? "Activo" : "Inactivo";
  const iconoEstado = isUserActive ? <FiCheckCircle /> : <FiAlertCircle />;

  return (
    <div className="dashboard-container membership-wrapper">
      
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Mi Suscripción</p>
          <h1 className="user-name">Estado de Cuota</h1>
        </div>
      </header>

      {/* --- TARJETA PRINCIPAL DE ESTADO --- */}
      <section className={`bento-card status-hero-card ${estadoClaseCSS} slide-up`} style={{ animationDelay: "0.1s" }}>
        
        <div className="status-badge">
          <span className="status-icon">{iconoEstado}</span>
          <span className="estado-text">{textoEstado}</span>
        </div>

        <div className="monto-gigante">
          <span className="currency">$</span>
          {ultimoPago}
        </div>

        <div className="fechas-info">
          <div className="fecha-box">
            <span className="fecha-label">Último pago</span>
            <span className="fecha-valor"><FiCheckCircle className="tiny-icon"/> {fechaUltimoPago}</span>
          </div>
          <div className="fecha-box highlight">
            <span className="fecha-label">Próximo vencimiento</span>
            <span className="fecha-valor"><FiCalendar className="tiny-icon"/> {fechaVencimiento}</span>
          </div>
        </div>

        {/* Barra de progreso de ciclo (Solo la mostramos si está activo y tiene % calculado) */}
        {isUserActive && (
          <div className="progress-wrapper">
            <div className="progress-labels">
              <span>Días consumidos</span>
              <span>{porcentajeConsumido}%</span>
            </div>
            <div className="glass-progress-bar">
              <div 
                className="glass-progress-fill" 
                style={{ width: `${porcentajeConsumido}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* --- HISTORIAL DE PAGOS --- */}
      <section className="bento-card history-card slide-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="section-subtitle">Pagos Anteriores</h3>
        
        <div className="payment-list">
          {historialPagos.length > 0 ? (
            historialPagos.map((pago, index) => {
              const f = new Date(pago.payment_date);
              const fechaFormateada = f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              
              return (
                <div key={index} className="payment-row">
                  <div className="payment-icon-wrapper">
                    <FiDollarSign />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">Pago Mensualidad</span>
                    <span className="payment-date">{fechaFormateada}</span>
                  </div>
                  <div className="payment-amount-status">
                    <span className="payment-amount">${pago.amount}</span>
                    <span className={`payment-pill ${pago.status === 'COMPLETED' ? 'paid' : 'pending'}`}>
                      {pago.status === 'COMPLETED' ? 'Pagado' : pago.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#6B7280", fontSize: "0.9rem", marginTop: "1rem" }}>
              No hay registros de pagos anteriores.
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default MembershipStatus;