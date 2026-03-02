import React from "react";
import "./Perfil.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; 
// Importamos íconos minimalistas (Feather Icons)
import { 
  FiEdit2, 
  FiTrendingUp, 
  FiCreditCard, 
  FiActivity, 
  FiPieChart, 
  FiLock, 
  FiBell, 
  FiChevronRight,
  FiLogOut
} from "react-icons/fi";

const Perfil = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("crmToken");
      localStorage.removeItem("userData");
      window.location.href = "/"; 
    }
  };

  return (
    <div className="dashboard-container profile-wrapper">
      
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Ajustes de cuenta</p>
          <h1 className="user-name">Mi Perfil</h1>
        </div>
      </header>

      {/* --- TARJETA DE USUARIO --- */}
      <section className="bento-card user-card slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="avatar-container">
          <img className="profile-avatar" src="./profile.jpg" alt="Foto de perfil" />
          <button className="edit-avatar-btn">
            <FiEdit2 />
          </button>
        </div>
        <div className="user-info">
          <h2 className="profile-name">Gonzalo Sánchez</h2>
          <p className="profile-email">gonzalo.sanchez.develop@gmail.com</p>
          <span className="badge-premium">Miembro Premium</span>
        </div>
      </section>

      {/* --- TARJETAS DE ESTADÍSTICAS --- */}
      <div className="profile-stats-grid slide-up" style={{ animationDelay: "0.2s" }}>
        
        <div className="stat-box glass-box">
          <span className="stat-icon"><FiTrendingUp /></span>
          <span className="stat-label">Progreso</span>
          <span className="stat-value">75 kg</span>
          <span className="stat-desc">Meta: Definición</span>
        </div>

        <div className="stat-box glass-box">
          <span className="stat-icon"><FiCreditCard /></span>
          <span className="stat-label">Suscripción</span>
          <span className="stat-value">Activa</span>
          <span className="stat-desc">Vence: 15/12</span>
        </div>

      </div>

      {/* --- TARJETA DE ACCIONES --- */}
      <section className="bento-card actions-card slide-up" style={{ animationDelay: "0.3s" }}>
        <h3 className="section-subtitle">Configuración del Plan</h3>
        <div className="action-list">
          <button className="glass-action-btn" onClick={() => navigate("/rutinesForm")}>
            <span className="btn-icon"><FiActivity /></span>
            <span className="btn-text">Modificar mi rutina</span>
            <FiChevronRight className="arrow-icon" />
          </button>
          
          <button className="glass-action-btn" onClick={() => navigate("/nutritionForm")}>
            <span className="btn-icon"><FiPieChart /></span>
            <span className="btn-text">Modificar mi dieta</span>
            <FiChevronRight className="arrow-icon" />
          </button>
        </div>

        <h3 className="section-subtitle mt-4">Cuenta y Seguridad</h3>
        <div className="action-list">
          <button className="glass-action-btn">
            <span className="btn-icon"><FiLock /></span>
            <span className="btn-text">Cambiar contraseña</span>
            <FiChevronRight className="arrow-icon" />
          </button>

          <button className="glass-action-btn">
            <span className="btn-icon"><FiBell /></span>
            <span className="btn-text">Notificaciones</span>
            <FiChevronRight className="arrow-icon" />
          </button>
        </div>
      </section>

      {/* --- BOTÓN DE CERRAR SESIÓN --- */}
      <div className="logout-container slide-up" style={{ animationDelay: "0.4s" }}>
        <button className="danger-glass-btn" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          Cerrar sesión
        </button>
      </div>

    </div>
  );
};

export default Perfil;