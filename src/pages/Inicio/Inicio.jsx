import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Inicio.css";
import { supabase } from "../../supabaseClient"; 
import { FiPlus, FiX, FiTrendingUp, FiTarget, FiCalendar, FiActivity, FiAlertCircle } from "react-icons/fi";

// --- HOOK PARA ANIMAR NÚMEROS ---
const useCountUp = (endValue, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!endValue) {
      setCount(0);
      return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setCount(easeProgress * endValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return count.toFixed(decimals);
};

// --- COMPONENTES BENTO ---

const MacroCapsule = ({ label, grams, totalKcal, calMultiplier, color, shadowColor, delay }) => {
  const animatedGrams = useCountUp(grams, 1500);
  const macroKcal = grams * calMultiplier;
  const percentage = totalKcal > 0 ? Math.min((macroKcal / totalKcal) * 100, 100) : 0;
  
  return (
    <div className="nutrition-capsule" style={{ animationDelay: `${delay}s` }}>
      <div className="capsule-header">
        <span className="capsule-label">{label}</span>
        <span className="capsule-value"><strong>{animatedGrams}g</strong> <span className="opacity-70">({percentage.toFixed(0)}%)</span></span>
      </div>
      <div className="capsule-track">
        <div 
          className="capsule-fill glow-effect" 
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 12px ${shadowColor}` }}
        ></div>
      </div>
    </div>
  );
};

// 🔹 GRÁFICO DINÁMICO DE EVOLUCIÓN
const DynamicWeightChart = ({ data, targetWeight, onAddClick }) => {
  const currentWeight = data.length > 0 ? data[data.length - 1].weight : 0;
  const animatedWeight = useCountUp(currentWeight, 2000, 1);
  
  const firstWeight = data.length > 0 ? data[0].weight : 0;
  const diff = (currentWeight - firstWeight).toFixed(1);
  const trendClass = diff <= 0 ? "down" : "up";
  const trendArrow = diff <= 0 ? "↓" : "↑";

  const width = 400;
  const height = 80;
  const padding = 10;

  const points = data.length === 1 ? [data[0], data[0]] : (data.length === 0 ? [{weight: 0}, {weight: 0}] : data);
  
  const minW = Math.min(...points.map(d => d.weight));
  const maxW = Math.max(...points.map(d => d.weight));
  const range = (maxW - minW) === 0 ? 1 : (maxW - minW); 

  const coords = points.map((d, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (((d.weight - minW) / range) * (height - padding * 2)) - padding;
    return { x, y };
  });

  const pathD = `M ${coords.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const fillD = `M 0,${height} L ${coords[0].x},${coords[0].y} L ${coords.map(p => `${p.x},${p.y}`).join(" L ")} L ${width},${height} Z`;

  return (
    <div className="organic-chart-container">
      <div className="weight-header">
        <div>
          <span className="weight-current">{animatedWeight} <small>kg</small></span>
          {data.length > 1 && (
             <span className={`weight-trend ${trendClass}`}>{trendArrow} {Math.abs(diff)} kg en total</span>
          )}
        </div>
        <div className="weight-actions-group">
          <div className="weight-goal glass-badge">Meta: {targetWeight} kg</div>
          <button className="add-weight-btn" onClick={onAddClick} title="Actualizar peso">
            <FiPlus />
          </button>
        </div>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="sparkline-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {data.length > 1 && <path d={fillD} fill="url(#chartGradient)" />}
        
        <path 
          d={pathD} 
          fill="none" 
          stroke="#2563EB" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="sparkline-path"
          filter="url(#glow)"
        />
        
        {data.length > 0 && (
          <circle 
            cx={coords[coords.length - 1].x} 
            cy={coords[coords.length - 1].y} 
            r="6" 
            fill="#FFFFFF" 
            stroke="#2563EB" 
            strokeWidth="3" 
            className="sparkline-dot" 
          />
        )}
      </svg>
    </div>
  );
};

const WeeklyActivity = ({ weekData }) => {
  return (
    <div className="weekly-activity">
      {weekData.map((d, i) => (
        <div key={i} className={`day-bubble ${d.status}`}>
          <span className="day-name">{d.day}</span>
          <div className="status-indicator"></div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Inicio = () => {
  const navigate = useNavigate(); 

  const [isLoading, setIsLoading] = useState(true); 

  const [userName, setUserName] = useState("Gonzalo");
  const [dietStats, setDietStats] = useState({ kcal: 0, p: 0, c: 0, f: 0 });
  const [weightHistory, setWeightHistory] = useState([]);
  
  // 👉 NUEVO ESTADO: Controla si el usuario está activo o no
  const [isUserActive, setIsUserActive] = useState(true);

  // Asistencia dinámica
  const [weekAttendance, setWeekAttendance] = useState([
    { day: "Lun", status: "future" }, { day: "Mar", status: "future" }, { day: "Mié", status: "future" },
    { day: "Jue", status: "future" }, { day: "Vie", status: "future" }, { day: "Sáb", status: "future" }, { day: "Dom", status: "future" }
  ]);
  const [streak, setStreak] = useState(0);
  
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  // Utilidad para obtener el inicio de la semana (Lunes)
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const fetchDashboardData = async () => {
    try {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;
      
      if (!userId) {
        navigate("/login");
        return;
      }

      // 👉 0. VALIDACIÓN DE ESTADO DEL USUARIO (ENABLED)
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('first_name, enabled')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userInfo.first_name) setUserName(userInfo.first_name);

      // Leemos estrictamente el booleano enabled
      const estaActivo = userInfo.enabled === true || String(userInfo.enabled).toLowerCase() === "true";
      setIsUserActive(estaActivo);

      // Si no está activo, detenemos la carga de datos del dashboard para ahorrar consultas
      if (!estaActivo) {
        setIsLoading(false);
        return; 
      }

      // 1. Dieta
      const { data: dietPlan } = await supabase.from('diet_plans').select('daily_meals ( breakfast, lunch, snack, dinner )').eq('user_id', userId).eq('is_active', true).single();
      if (dietPlan && dietPlan.daily_meals) {
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
        let dayCount = dietPlan.daily_meals.length || 1;
        dietPlan.daily_meals.forEach(meal => {
          [meal.breakfast, meal.lunch, meal.snack, meal.dinner].forEach(mStr => {
            const arr = mStr ? JSON.parse(mStr) : [];
            arr.forEach(item => {
              totalKcal += (item.food?.kcal || 0); totalP += (item.food?.p || 0); totalC += (item.food?.c || 0); totalF += (item.food?.f || 0);
            });
          });
        });
        setDietStats({ kcal: Math.round(totalKcal/dayCount), p: Math.round(totalP/dayCount), c: Math.round(totalC/dayCount), f: Math.round(totalF/dayCount) });
      }

      // 2. Peso
      const { data: weights } = await supabase.from('weight_logs').select('weight, created_at').eq('user_id', userId).order('created_at', { ascending: true }); 
      if (weights && weights.length > 0) setWeightHistory(weights);
      else {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          if (userData.weight_kg) setWeightHistory([{ weight: userData.weight_kg, created_at: new Date().toISOString() }]);
      }

      // 3. ASISTENCIA DE LA SEMANA ACTUAL
      const startOfWeek = getStartOfWeek();
      const { data: logs } = await supabase
        .from('access_logs')
        .select('check_in_time')
        .eq('user_id', userId)
        .gte('check_in_time', startOfWeek.toISOString());

      if (logs) {
        setStreak(logs.length); 
        const today = new Date();
        const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; 
        
        const newWeek = [
          { day: "Lun", status: "future" }, { day: "Mar", status: "future" }, { day: "Mié", status: "future" },
          { day: "Jue", status: "future" }, { day: "Vie", status: "future" }, { day: "Sáb", status: "future" }, { day: "Dom", status: "future" }
        ];

        for (let i = 0; i < currentDayIndex; i++) newWeek[i].status = "missed";
        newWeek[currentDayIndex].status = "today";

        logs.forEach(log => {
          const logDate = new Date(log.check_in_time);
          const logDayIndex = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1;
          newWeek[logDayIndex].status = "done";
        });

        setWeekAttendance(newWeek);
      }
    } catch (err) { 
      console.error("Error cargando el Dashboard:", err); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const handleSaveWeight = async () => {
    if (!newWeightInput || isNaN(newWeightInput)) return;
    setIsSavingWeight(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;
      const { error } = await supabase.from('weight_logs').insert({ user_id: userId, weight: parseFloat(newWeightInput) });
      if (error) throw error;
      await supabase.from('users').update({ weight_kg: parseFloat(newWeightInput) }).eq('id', userId);
      await fetchDashboardData();
      setShowWeightModal(false);
      setNewWeightInput("");
    } catch (err) { alert("Hubo un error al guardar el peso."); } 
    finally { setIsSavingWeight(false); }
  };

  const animatedCalories = useCountUp(dietStats.kcal, 2000);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userData");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <main className="dashboard-container">
        <header className="dashboard-header fade-in">
          <p className="greeting">Cargando progreso...</p>
        </header>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      
      {/* 👉 CABECERA CON ESTADO DINÁMICO */}
      <header className="dashboard-header fade-in">
        <p className="greeting">Panel de progreso</p>
        <div className="header-title-row">
          <h1 className="user-name">Hola, {userName}</h1>
          
          {/* CARTELITO DINÁMICO: Verde si activo, Rojo si inactivo */}
          <div className={`status-pill ${isUserActive ? 'active' : 'inactive'} glass-pill`}>
            <div className="pulse-dot" style={{ backgroundColor: isUserActive ? '#10B981' : '#EF4444' }}></div>
            {isUserActive ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      </header>

      <div className="bento-grid" style={{ filter: !isUserActive ? 'blur(4px)' : 'none', pointerEvents: !isUserActive ? 'none' : 'auto' }}>
        
        {/* 1. EVOLUCIÓN CORPORAL */}
        <section className="bento-card col-span-2 slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="card-title">
            <div className="title-icon icon-blue"><FiTrendingUp /></div>
            Evolución Corporal
          </h2>
          <DynamicWeightChart data={weightHistory} targetWeight={70.0} onAddClick={() => setShowWeightModal(true)} />
        </section>

        {/* 2. NUTRICIÓN */}
        <section className="bento-card slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="nutrition-header">
            <h2 className="card-title">
              <div className="title-icon icon-orange"><FiTarget /></div>
              Objetivo Diario
            </h2>
            <span className="calories-left"><strong>{animatedCalories}</strong> kcal</span>
          </div>
          <div className="capsules-container">
            <MacroCapsule label="Proteínas" grams={dietStats.p} totalKcal={dietStats.kcal} calMultiplier={4} color="#10B981" shadowColor="rgba(16, 185, 129, 0.4)" delay={0.3} />
            <MacroCapsule label="Carbohidratos" grams={dietStats.c} totalKcal={dietStats.kcal} calMultiplier={4} color="#F59E0B" shadowColor="rgba(245, 158, 11, 0.4)" delay={0.4} />
            <MacroCapsule label="Grasas" grams={dietStats.f} totalKcal={dietStats.kcal} calMultiplier={9} color="#6366F1" shadowColor="rgba(99, 102, 241, 0.4)" delay={0.5} />
          </div>
        </section>

        {/* 3. WIDGET DE ASISTENCIA */}
        <section className="bento-card col-span-2 slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="header-split">
            <h2 className="card-title">
              <div className="title-icon icon-purple"><FiCalendar /></div>
              Tu Semana
            </h2>
            <div className="streak-badge glow-amber" title="Racha de asistencias">
              <span className="streak-icon">🔥</span>
              <span className="streak-number">{streak}</span>
            </div>
          </div>
          <WeeklyActivity weekData={weekAttendance} />
        </section>

        {/* 4. MÉTRICAS CLAVE */}
        <section className="bento-card summary-bento slide-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="card-title">
            <div className="title-icon icon-green"><FiActivity /></div>
            Métricas Clave
          </h2>
          <div className="quick-stats-grid">
            <div className="stat-box glass-box-inner"><span className="stat-label">IMC</span><span className="stat-value">23.5</span><span className="stat-desc">Saludable</span></div>
            <div className="stat-box glass-box-inner"><span className="stat-label">Entrenos</span><span className="stat-value">{streak}</span><span className="stat-desc">Esta semana</span></div>
          </div>
        </section>
        
      </div>

      {/* 👉 POPUP BLOQUEADOR PARA USUARIOS INACTIVOS */}
      {!isUserActive && !isLoading && (
        <div className="glass-modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <FiAlertCircle size={48} color="#EF4444" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Suscripción Inactiva</h3>
            <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Tu acceso ha sido bloqueado porque tu plan se encuentra inactivo o vencido. Por favor, acércate a la recepción del gimnasio para regularizar tu situación.
            </p>
            <button 
              className="btn-primary w-full" 
              onClick={handleLogout} 
              style={{ backgroundColor: '#EF4444', border: 'none' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE PESO */}
      {showWeightModal && isUserActive && (
        <div className="glass-modal-overlay">
          <div className="glass-modal fade-in">
            <button className="close-modal-btn" onClick={() => setShowWeightModal(false)}><FiX /></button>
            <h3>Registrar nuevo peso</h3>
            <p>Actualiza tu progreso para ver la evolución en el gráfico.</p>
            <div className="input-group">
              <input type="number" className="glass-input" placeholder="Ej: 71.5" value={newWeightInput} onChange={(e) => setNewWeightInput(e.target.value)} autoFocus />
              <span className="input-suffix">kg</span>
            </div>
            <button className="btn-primary w-full" onClick={handleSaveWeight} disabled={isSavingWeight || !newWeightInput} style={{ marginTop: '1.5rem' }}>
              {isSavingWeight ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Inicio;