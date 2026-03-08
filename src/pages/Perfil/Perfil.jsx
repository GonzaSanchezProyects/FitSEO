import React, { useState, useEffect } from "react";
import "./Perfil.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; 
import { 
  FiTrendingUp, 
  FiCreditCard, 
  FiActivity, 
  FiPieChart, 
  FiChevronRight,
  FiLogOut,
  FiMessageCircle
} from "react-icons/fi";

const Perfil = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ firstName: "Usuario", lastName: "", email: "" });
  const [currentWeight, setCurrentWeight] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        const userEmail = authData?.session?.user?.email;

        if (!userId) {
          navigate("/login");
          return;
        }

        const { data: userRecord } = await supabase
          .from('users')
          .select('first_name, last_name, weight_kg')
          .eq('id', userId)
          .single();

        if (userRecord) {
          setUserData({
            firstName: userRecord.first_name || "Usuario",
            lastName: userRecord.last_name || "",
            email: userEmail || "Sin email registrado"
          });
          setCurrentWeight(userRecord.weight_kg || 0); 
        }

        const { data: weightLogs } = await supabase
          .from('weight_logs')
          .select('weight')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (weightLogs && weightLogs.length > 0) {
          setCurrentWeight(weightLogs[0].weight);
        }

      } catch (err) {
        console.error("Error cargando el perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const getInitials = () => {
    const f = userData.firstName.charAt(0).toUpperCase();
    const l = userData.lastName ? userData.lastName.charAt(0).toUpperCase() : "";
    return `${f}${l}`;
  };

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

  const handleSupportClick = () => {
    const phoneNumber = "5492610000000"; 
    const message = "Hola, necesito ayuda con mi cuenta en la app.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="dashboard-container profile-wrapper">
        <header className="dashboard-header fade-in">
          <p className="greeting">Cargando perfil...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="dashboard-container profile-wrapper">
      
      {/* --- HEADER --- */}
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Ajustes de cuenta</p>
          <h1 className="user-name">Mi Perfil</h1>
        </div>
      </header>

      <div className="bento-grid">
        {/* --- TARJETA DE USUARIO --- */}
        <section className="bento-card user-card slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="avatar-container">
            <div className="avatar-initials">
              {getInitials()}
            </div>
          </div>
          <div className="user-info">
            <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>
            <p className="profile-email">{userData.email}</p>
            <span className="badge-premium">Miembro Premium</span>
          </div>
        </section>

        {/* --- TARJETAS DE ESTADÍSTICAS --- */}
        <div className="profile-stats-grid slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="stat-box glass-box-inner">
            <span className="stat-icon"><FiTrendingUp /></span>
            <span className="stat-label">Peso Actual</span>
            <span className="stat-value">{currentWeight} <small>kg</small></span>
            <span className="stat-desc">En Seguimiento</span>
          </div>

          <div className="stat-box glass-box-inner clickable" onClick={() => navigate("/cuota")}>
            <span className="stat-icon"><FiCreditCard /></span>
            <span className="stat-label">Suscripción</span>
            <span className="stat-value">Activa</span>
            <span className="stat-desc">Vence: 15/12</span>
          </div>
        </div>

        {/* --- TARJETAS DE ACCIONES --- */}
        <section className="bento-card actions-card slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="section-subtitle">Configuración y Ayuda</h3>
          <div className="action-list">
            <button className="glass-action-btn" onClick={() => navigate("/rutinesForm")}>
              <div className="btn-icon-wrapper icon-blue"><FiActivity /></div>
              <span className="btn-text">Generar nueva rutina</span>
              <FiChevronRight className="arrow-icon" />
            </button>
            
            <button className="glass-action-btn" onClick={() => navigate("/nutritionForm")}>
              <div className="btn-icon-wrapper icon-orange"><FiPieChart /></div>
              <span className="btn-text">Generar nueva dieta</span>
              <FiChevronRight className="arrow-icon" />
            </button>

            {/* Agregamos el botón de WhatsApp que tenías preparado */}
            <button className="glass-action-btn" onClick={handleSupportClick}>
              <div className="btn-icon-wrapper icon-green"><FiMessageCircle /></div>
              <span className="btn-text">Soporte por WhatsApp</span>
              <FiChevronRight className="arrow-icon" />
            </button>
          </div>
        </section>
      </div>

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