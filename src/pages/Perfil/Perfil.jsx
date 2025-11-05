import "./Perfil.css";

const Perfil = () => {
  return (
    <div className="profile-section-container">
      <h2 data-aos="fade-up" data-aos-delay="0" data-aos-duration="300">Mi Perfil</h2>

      {/* --- Foto y Nombre --- */}
      <div className="profile-header" data-aos="fade-up" data-aos-delay="100" data-aos-duration="300">
        <img data-aos="flip-left" data-aos-delay="800" data-aos-duration="300" className="profile-pic" src="./profile.jpg" alt="Foto de perfil" />
        <div className="profile-info">
          <span className="profile-name">Gonzalo Sánchez</span>
          <span className="profile-email">gonzalo@email.com</span>
        </div>
      </div>

      {/* --- Opciones del Perfil --- */}
      <div className="profile-options">
        <button className="profile-btn" data-aos="fade-up" data-aos-delay="200" data-aos-duration="300">Cambiar foto de perfil</button>
        <button className="profile-btn" data-aos="fade-up" data-aos-delay="300" data-aos-duration="300">Modificar rutina</button>
        <button className="profile-btn" data-aos="fade-up" data-aos-delay="400" data-aos-duration="300">Modificar dieta</button>
        <button className="profile-btn" data-aos="fade-up" data-aos-delay="500" data-aos-duration="300">Cambiar contraseña</button>
        <button className="profile-btn" data-aos="fade-up" data-aos-delay="600" data-aos-duration="300">Opciones de notificación</button>
        <button className="profile-btn logout-btn" data-aos="fade-up" data-aos-delay="700" data-aos-duration="300">Cerrar sesión</button>
      </div>

      {/* --- Información adicional --- */}
      <div className="profile-extra">
        <h3 data-aos="fade-up" data-aos-delay="800" data-aos-duration="300">Progreso</h3>
        <p data-aos="fade-up" data-aos-delay="900" data-aos-duration="300">Peso actual: 75 kg</p>
        <p data-aos="fade-up" data-aos-delay="1000" data-aos-duration="300">Objetivo: Definición</p>

        <h3 data-aos="fade-up" data-aos-delay="1100" data-aos-duration="300">Suscripción</h3>
        <p data-aos="fade-up" data-aos-delay="1200" data-aos-duration="300">Plan: Premium</p>
        <p data-aos="fade-up" data-aos-delay="1300" data-aos-duration="300">Vence el: 15/12/2025</p>
      </div>
    </div>
  );
};

export default Perfil;
