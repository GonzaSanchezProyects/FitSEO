import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "./NutritionPlan.css";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useNavigate } from "react-router-dom";

// 👉 Íconos minimalistas + Nuevos iconos para las pantallas de estado
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCoffee, 
  FiSun, 
  FiMoon, 
  FiInfo, 
  FiClock,
  FiRefreshCw, // Icono giratorio de carga
  FiAlertCircle, // Icono de error
  FiClipboard  // Icono de plan vacío
} from "react-icons/fi";

import { supabase } from "../../supabaseClient"; 

const NutritionPlan = () => {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null); 
  const [stats, setStats] = useState({ kcal: 0, p: 0, c: 0, f: 0, pPct: 0, cPct: 0, fPct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dayKeys, setDayKeys] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);

  const proteinRoot = useRef(null);
  const carbsRoot = useRef(null);
  const fatRoot = useRef(null);

  // 1. Cargar datos directamente desde SUPABASE
  const fetchDiet = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;

      if (!userId) {
        navigate("/login");
        return;
      }

      const { data: dietPlan, error: dbError } = await supabase
        .from('diet_plans')
        .select(`
          id,
          start_date,
          daily_meals (
            day_name,
            breakfast,
            lunch,
            snack,
            dinner
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single(); 

      if (dbError || !dietPlan || !dietPlan.daily_meals || dietPlan.daily_meals.length === 0) {
        setPlanData(null);
        setLoading(false);
        return;
      }

      const generated = {};
      
      dietPlan.daily_meals.forEach(meal => {
        generated[meal.day_name] = {
          desayuno: meal.breakfast ? JSON.parse(meal.breakfast) : [],
          almuerzo: meal.lunch ? JSON.parse(meal.lunch) : [],
          colaciones: meal.snack ? JSON.parse(meal.snack) : [],
          cena: meal.dinner ? JSON.parse(meal.dinner) : []
        };
      });

      const weekOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const keys = Object.keys(generated).sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));

      setPlanData(generated);
      setDayKeys(keys);

      let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
      let dayCount = keys.length;

      Object.values(generated).forEach(dayMeals => {
          ["desayuno","almuerzo","cena","colaciones"].forEach(m => {
              dayMeals[m].forEach(item => {
                  totalKcal += (item.food?.kcal || 0);
                  totalP += (item.food?.p || 0);
                  totalC += (item.food?.c || 0);
                  totalF += (item.food?.f || 0);
              });
          });
      });

      const avgKcal = Math.round(totalKcal / dayCount) || 0;
      const avgP = Math.round(totalP / dayCount) || 0;
      const avgC = Math.round(totalC / dayCount) || 0;
      const avgF = Math.round(totalF / dayCount) || 0;

      const calP = avgP * 4;
      const calC = avgC * 4;
      const calF = avgF * 9;
      const totalEnergy = calP + calC + calF || 1;

      setStats({
          kcal: avgKcal,
          p: avgP, c: avgC, f: avgF,
          pPct: Math.round((calP / totalEnergy) * 100) || 0,
          cPct: Math.round((calC / totalEnergy) * 100) || 0,
          fPct: Math.round((calF / totalEnergy) * 100) || 0
      });

    } catch (err) {
      console.error("Error cargando dieta de Supabase:", err);
      setError("Hubo un error al cargar tu dieta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiet();
  }, [navigate]);

  // 2. Render Charts de AmCharts
  useLayoutEffect(() => {
    if (loading || !stats.kcal) return;
    
    const createRing = (ref, divId, color, percentage, restColor) => {
      if (ref.current) {
        try { ref.current.dispose(); } catch (e) {}
      }
      const root = am5.Root.new(divId);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5percent.PieChart.new(root, { layout: root.verticalLayout, innerRadius: am5.percent(70) })
      );
      const series = chart.series.push(
        am5percent.PieSeries.new(root, { valueField: "value", categoryField: "category", alignLabels: false })
      );
      series.labels.template.set("visible", false);
      series.ticks.template.set("visible", false);
      
      const data = [
        { category: "Consumido", value: percentage, fill: am5.color(color) },
        { category: "Restante", value: 100 - percentage, fill: am5.color(restColor) },
      ];
      series.data.setAll(data);
      
      series.slices.template.setAll({ 
        stroke: am5.color(0xffffff), 
        strokeWidth: 2, 
        strokeOpacity: 0.2,
        templateField: "fill" 
      });
      
      series.slices.each((slice, index) => {
        if (data[index].fill) slice.set("fill", data[index].fill);
      });
      series.appear(1000, 100);
      ref.current = root;
    };

    createRing(proteinRoot, "proteinRing", "#10B981", stats.pPct, "#E2E8F0"); 
    createRing(carbsRoot, "carbsRing", "#F59E0B", stats.cPct, "#E2E8F0"); 
    createRing(fatRoot, "fatRing", "#2563EB", stats.fPct, "#E2E8F0"); 

    return () => {
      [proteinRoot, carbsRoot, fatRoot].forEach((r) => {
        try { r.current?.dispose(); r.current = null; } catch (e) {}
      });
    };
  }, [loading, stats]);

  const handlePrev = () => setViewIndex(prev => (prev - 1 + dayKeys.length) % dayKeys.length);
  const handleNext = () => setViewIndex(prev => (prev + 1) % dayKeys.length);

  const getMealIcon = (meal) => {
    switch(meal) {
      case 'desayuno': return <FiCoffee />;
      case 'almuerzo': return <FiSun />;
      case 'cena': return <FiMoon />;
      case 'colaciones': return <FiClock />;
      default: return <FiClock />;
    }
  };

  // --- ESTADOS DE CARGA Y ERROR (Estilo Premium) ---
  if (loading) return (
    <div className="dashboard-container nutrition-wrapper">
      <div className="status-state-card fade-in">
        <div className="spinner-wrapper">
          <FiRefreshCw className="spinning-icon" />
        </div>
        <h2>Sincronizando menú...</h2>
        <p>Calculando calorías y macros desde tu perfil.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container nutrition-wrapper">
      <div className="status-state-card error-card fade-in">
        <div className="icon-wrapper error">
          <FiAlertCircle />
        </div>
        <h2>Ocurrió un error</h2>
        <p>{error}</p>
        <button className="btn-primary glow-btn mt-2" onClick={fetchDiet}>Reintentar</button>
      </div>
    </div>
  );

  // --- ESTADO VACÍO (Sin Dieta) ---
  if (!planData || Object.keys(planData).length === 0) return (
    <div className="dashboard-container nutrition-wrapper">
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Tu alimentación</p>
          <h1 className="user-name">Sin Dieta Activa</h1>
        </div>
      </header>

      <div className="status-state-card empty-card slide-up">
        <div className="icon-wrapper empty">
          <FiClipboard />
        </div>
        <h2>No tienes un plan nutricional</h2>
        <p>Genera una dieta personalizada basada en tus objetivos, peso actual e intolerancias alimenticias.</p>
        <button className="btn-primary glow-btn mt-2" onClick={() => navigate('/nutritionForm')}>
          Generar Mi Dieta
        </button>
      </div>
    </div>
  );

  const currentDayName = dayKeys[viewIndex];
  const currentMeals = planData[currentDayName];

  return (
    <div className="dashboard-container nutrition-wrapper">
      
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Tu alimentación</p>
          <h1 className="user-name">Plan Nutricional</h1>
        </div>
      </header>

      {/* Navegador de Días (Estilo Píldora) */}
      <div className="diet-day-nav slide-up" style={{ animationDelay: "0.1s" }}>
        <button onClick={handlePrev} className="nav-arrow-btn"><FiChevronLeft /></button>
        <div className="day-display">
          <strong className="current-day-text">{currentDayName}</strong>
          <span className="day-counter">Día {viewIndex + 1} de {dayKeys.length}</span>
        </div>
        <button onClick={handleNext} className="nav-arrow-btn"><FiChevronRight /></button>
      </div>

      {/* Gráficos de Macros (Bento Card) */}
      <section className="bento-card charts-card slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="card-header-split">
          <h3 className="card-title">Promedio Diario</h3>
          <span className="status-pill highlight-pill">{stats.kcal} kcal</span>
        </div>
        
        <div className="macros-grid">
          <div className="macro-widget">
            <div className="chart-wrapper">
              <div id="proteinRing" className="chart-div"></div>
              <span className="ratio-text" style={{ color: "var(--accent-success)" }}>{stats.pPct}%</span>
            </div>
            <div className="macro-info">
              <p className="macro-name">Proteínas</p>
              <p className="macro-grams">{stats.p}g</p>
            </div>
          </div>
          
          <div className="macro-widget">
            <div className="chart-wrapper">
              <div id="carbsRing" className="chart-div"></div>
              <span className="ratio-text" style={{ color: "var(--accent-warning)" }}>{stats.cPct}%</span>
            </div>
            <div className="macro-info">
              <p className="macro-name">Carbos</p>
              <p className="macro-grams">{stats.c}g</p>
            </div>
          </div>
          
          <div className="macro-widget">
            <div className="chart-wrapper">
              <div id="fatRing" className="chart-div"></div>
              <span className="ratio-text" style={{ color: "var(--accent-primary)" }}>{stats.fPct}%</span>
            </div>
            <div className="macro-info">
              <p className="macro-name">Grasas</p>
              <p className="macro-grams">{stats.f}g</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Comidas */}
      <div className="meals-container">
        {["desayuno", "almuerzo", "colaciones", "cena"].map((mealKey, idx) => (
             <div key={mealKey} className="bento-card meal-card slide-up" style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}>
                <div className="meal-header">
                  <div className="meal-icon-box">{getMealIcon(mealKey)}</div>
                  <h3 className="meal-title">{mealKey}</h3>
                </div>
                
                <ul className="meal-list">
                    {currentMeals[mealKey] && currentMeals[mealKey].map((item, i) => (
                        <li className="meal-item" key={i}>
                            <div className="meal-info">
                                <span className="food-name">{item.food.name}</span>
                                {item.modified && (
                                  <span className="food-alert">
                                    <FiInfo /> Sustitución
                                  </span>
                                )}
                            </div>
                            <div className="food-macros">
                                <span className="macro-badge kcal">{item.food.kcal} kcal</span>
                                <span className="macro-badge p">P: {item.food.p}g</span>
                                <span className="macro-badge c">C: {item.food.c}g</span>
                                <span className="macro-badge f">G: {item.food.f}g</span>
                            </div>
                        </li>
                    ))}
                </ul>
             </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPlan;