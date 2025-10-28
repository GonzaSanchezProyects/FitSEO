import "./MembershipStatus.css";

const MembershipStatus = () => {
  // Datos de ejemplo
  const cuota = {
    estado: "Pagada", // "Pagada", "Vencida"
    monto: 500,
    ultimoPago: "15/10/2025",
    proximoVencimiento: "15/11/2025",
    porcentajePagado: 60, // para la barra de progreso
  };

  return (
    <div className="quota-container">
      <div data-aos="fade-in" data-aos-duration="100" className="ExerciseH2">
        <h2 className="titleMain">Estado de tu cuota</h2>
        <p>Día: 27/10/2025</p>
      </div>
      <div data-aos="fade-in" data-aos-duration="100" className={`quota-status ${cuota.estado.toLowerCase()}`}>
        <span className="estado">{cuota.estado}</span>
        <span className="monto">Monto: ${cuota.monto}</span>
        <span className="ultimoPago">Último pago: {cuota.ultimoPago}</span>
        <span className="proximoVencimiento">Próximo vencimiento: {cuota.proximoVencimiento}</span>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${cuota.porcentajePagado}%` }}
          ></div>
        </div>
      </div>
          <div className="previous-payments-container">
      <h3>Pagos anteriores</h3>

      <div className="payment-card" data-aos="fade-in" data-aos-delay="0" data-aos-duration="300">
        <span className="payment-date">15/09/2025</span>
        <span className="payment-amount">$500</span>
        <span className="payment-status paid">Pagado</span>
      </div>

      <div className="payment-card" data-aos="fade-in" data-aos-delay="100" data-aos-duration="300">
        <span className="payment-date">15/08/2025</span>
        <span className="payment-amount">$500</span>
        <span className="payment-status paid">Pagado</span>
      </div>

      <div className="payment-card" data-aos="fade-in" data-aos-delay="200" data-aos-duration="300">
        <span className="payment-date">15/07/2025</span>
        <span className="payment-amount">$500</span>
        <span className="payment-status paid">Pagado</span>
      </div>

      <div className="payment-card" data-aos="fade-in" data-aos-delay="300" data-aos-duration="300">
        <span className="payment-date">15/06/2025</span>
        <span className="payment-amount">$500</span>
        <span className="payment-status paid">Pagado</span>
      </div>
    </div>
    </div>
  );
};

export default MembershipStatus;