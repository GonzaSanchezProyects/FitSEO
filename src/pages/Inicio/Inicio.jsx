import React, { useState, useEffect } from "react";
import "./Inicio.css";

// --- HOOK PARA ANIMAR NÚMEROS (Micro-interacción premium) ---
const useCountUp = (endValue, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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

// --- COMPONENTES UI BENTO ---

const NutritionCapsule = ({ label, consumed, total, color, shadowColor, delay }) => {
  const percentage = Math.min((consumed / total) * 100, 100);
  const animatedConsumed = useCountUp(consumed, 1500);
  
  return (
    <div className="nutrition-capsule" style={{ animationDelay: `${delay}s` }}>
      <div className="capsule-header">
        <span className="capsule-label">{label}</span>
        <span className="capsule-value"><strong>{animatedConsumed}g</strong> / {total}g</span>
      </div>
      <div className="capsule-track">
        <div 
          className="capsule-fill" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${shadowColor}` /* Glow effect */
          }}
        ></div>
      </div>
    </div>
  );
};

const WeightSparkline = ({ currentWeight, targetWeight }) => {
  const animatedWeight = useCountUp(currentWeight, 2000, 1);

  return (
    <div className="organic-chart-container">
      <div className="weight-header">
        <div>
          <span className="weight-current">{animatedWeight} <small>kg</small></span>
          <span className="weight-trend down">↓ 1.2 kg este mes</span>
        </div>
        <div className="weight-goal">Meta: {targetWeight} kg</div>
      </div>
      
      <svg viewBox="0 0 400 100" className="sparkline-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          {/* Sombra para la línea del gráfico */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path 
          d="M 0 80 Q 40 70, 80 75 T 160 60 T 240 65 T 320 40 T 400 30 L 400 100 L 0 100 Z" 
          fill="url(#chartGradient)" 
        />
        <path 
          d="M 0 80 Q 40 70, 80 75 T 160 60 T 240 65 T 320 40 T 400 30" 
          fill="none" 
          stroke="#2563EB" 
          strokeWidth="4" 
          strokeLinecap="round" 
          className="sparkline-path"
          filter="url(#glow)"
        />
        <circle cx="400" cy="30" r="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" className="sparkline-dot" />
      </svg>
    </div>
  );
};

const WeeklyActivity = () => {
  const week = [
    { day: "Lun", status: "done" },
    { day: "Mar", status: "done" },
    { day: "Mié", status: "done" },
    { day: "Jue", status: "missed" },
    { day: "Vie", status: "done" },
    { day: "Sáb", status: "missed" },
    { day: "Dom", status: "today" }, 
  ];

  return (
    <div className="weekly-activity">
      {week.map((d, i) => (
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
  const userName = "Gonzalo";
  const animatedCalories = useCountUp(2230, 2000);

  return (
    <main className="dashboard-container">
      
      {/* HEADER LIMPIO */}
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Panel de progreso</p>
          <h1 className="user-name">Hola, {userName}</h1>
        </div>
        <div className="status-pill active glass-pill">
          <div className="pulse-dot"></div>
          Suscripción Activa (7 días)
        </div>
      </header>

      {/* BENTO BOX GRID */}
      <div className="bento-grid">
        
        {/* WIDGET 1: EVOLUCIÓN */}
        <section className="bento-card col-span-2 slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="card-title">Evolución Corporal</h2>
          <WeightSparkline currentWeight={72.8} targetWeight={70.0} />
        </section>

        {/* WIDGET 2: NUTRICIÓN LÍQUIDA */}
        <section className="bento-card slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="nutrition-header">
            <h2 className="card-title">Nutrición Hoy</h2>
            <span className="calories-left"><strong>{animatedCalories}</strong> kcal disp.</span>
          </div>
          <div className="capsules-container">
            <NutritionCapsule label="Proteínas" consumed={110} total={160} color="#10B981" shadowColor="rgba(16, 185, 129, 0.4)" delay={0.3} />
            <NutritionCapsule label="Carbohidratos" consumed={150} total={250} color="#F59E0B" shadowColor="rgba(245, 158, 11, 0.4)" delay={0.4} />
            <NutritionCapsule label="Grasas" consumed={40} total={70} color="#6366F1" shadowColor="rgba(99, 102, 241, 0.4)" delay={0.5} />
          </div>
        </section>

        {/* WIDGET 3: ASISTENCIA Y HÁBITOS */}
        <section className="bento-card col-span-2 slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="header-split">
            <h2 className="card-title">Tu Semana en el Gym</h2>
            <span className="streak-badge glow-amber">🔥 Racha: 3 días</span>
          </div>
          <WeeklyActivity />
        </section>

        {/* WIDGET 4: MÉTRICAS RÁPIDAS */}
        <section className="bento-card summary-bento slide-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="card-title">Métricas Clave</h2>
          <div className="quick-stats-grid">
            <div className="stat-box glass-box">
              <span className="stat-label">IMC</span>
              <span className="stat-value">23.5</span>
              <span className="stat-desc">Saludable</span>
            </div>
            <div className="stat-box glass-box">
              <span className="stat-label">Entrenamientos</span>
              <span className="stat-value">14</span>
              <span className="stat-desc">Este mes</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Inicio;