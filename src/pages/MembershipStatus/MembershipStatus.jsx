import React from "react";
import "./MembershipStatus.css";
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiDollarSign } from "react-icons/fi";

const MembershipStatus = () => {
  // Datos de ejemplo
  const cuota = {
    estado: "Pagada", // "Pagada", "Pendiente", "Vencida"
    monto: 500,
    ultimoPago: "15/10/2025",
    proximoVencimiento: "15/11/2025",
    porcentajePagado: 60, // para la barra de progreso
  };

  // Función para determinar el ícono según el estado
  const renderStatusIcon = (estado) => {
    switch(estado.toLowerCase()) {
      case 'pagada': return <FiCheckCircle />;
      case 'pendiente': return <FiClock />;
      case 'vencida': return <FiAlertCircle />;
      default: return <FiCheckCircle />;
    }
  };

  // Historial mockeado
  const historial = [
    { fecha: "15/09/2025", monto: 500, estado: "paid" },
    { fecha: "15/08/2025", monto: 500, estado: "paid" },
    { fecha: "15/07/2025", monto: 500, estado: "paid" },
    { fecha: "15/06/2025", monto: 450, estado: "paid" },
  ];

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
      <section className={`bento-card status-hero-card ${cuota.estado.toLowerCase()} slide-up`} style={{ animationDelay: "0.1s" }}>
        
        <div className="status-badge">
          <span className="status-icon">{renderStatusIcon(cuota.estado)}</span>
          <span className="estado-text">{cuota.estado}</span>
        </div>

        <div className="monto-gigante">
          <span className="currency">$</span>
          {cuota.monto}
        </div>

        <div className="fechas-info">
          <div className="fecha-box">
            <span className="fecha-label">Último pago</span>
            <span className="fecha-valor"><FiCheckCircle className="tiny-icon"/> {cuota.ultimoPago}</span>
          </div>
          <div className="fecha-box highlight">
            <span className="fecha-label">Próximo vencimiento</span>
            <span className="fecha-valor"><FiCalendar className="tiny-icon"/> {cuota.proximoVencimiento}</span>
          </div>
        </div>

        {/* Barra de progreso de ciclo */}
        <div className="progress-wrapper">
          <div className="progress-labels">
            <span>Días consumidos</span>
            <span>{cuota.porcentajePagado}%</span>
          </div>
          <div className="glass-progress-bar">
            <div 
              className="glass-progress-fill" 
              style={{ width: `${cuota.porcentajePagado}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* --- HISTORIAL DE PAGOS --- */}
      <section className="bento-card history-card slide-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="section-subtitle">Pagos Anteriores</h3>
        
        <div className="payment-list">
          {historial.map((pago, index) => (
            <div key={index} className="payment-row">
              <div className="payment-icon-wrapper">
                <FiDollarSign />
              </div>
              <div className="payment-details">
                <span className="payment-title">Pago Mensualidad</span>
                <span className="payment-date">{pago.fecha}</span>
              </div>
              <div className="payment-amount-status">
                <span className="payment-amount">${pago.monto}</span>
                <span className={`payment-pill ${pago.estado}`}>
                  {pago.estado === 'paid' ? 'Pagado' : pago.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default MembershipStatus;