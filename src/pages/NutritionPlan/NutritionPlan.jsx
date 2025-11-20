// NutritionPlan.jsx
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "./NutritionPlan.css";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useNavigate } from "react-router-dom";

/* ---------- CONFIG & CONSTANTS (IDÉNTICO AL FORMULARIO) ---------- */
const CRM_BASE = "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net";
const TEST_CLIENT_ID = 1;

/* HE AGREGADO MACROS (p, c, f) APROXIMADOS A TUS ALIMENTOS 
   PARA QUE LOS GRÁFICOS FUNCIONEN 
*/
const FOOD_POOLS = {
  desayuno: [
    { name: "Avena con leche", kcal: 300, p: 12, c: 45, f: 6, tags: ["dairy","higher_carb"] },
    { name: "Avena con bebida vegetal (sin lactosa)", kcal: 290, p: 8, c: 48, f: 5, tags: ["dairy_free","higher_carb"] },
    { name: "Yogur natural", kcal: 110, p: 10, c: 12, f: 0, tags: ["dairy"] },
    { name: "Yogur vegetal (sin lactosa)", kcal: 100, p: 6, c: 14, f: 2, tags: ["dairy_free"] },
    { name: "Tostadas integrales con palta", kcal: 320, p: 8, c: 35, f: 15, tags: ["gluten"] },
    { name: "Tostadas sin gluten con palta", kcal: 330, p: 6, c: 38, f: 15, tags: ["gluten_free"] },
    { name: "Huevos revueltos", kcal: 200, p: 14, c: 2, f: 14, tags: ["protein_rich"] },
    { name: "Omelette de claras con espinaca", kcal: 150, p: 20, c: 5, f: 2, tags: ["protein_rich","low_carb"] },
    { name: "Fruta (manzana)", kcal: 80, p: 0, c: 20, f: 0, tags: ["low_sugar"] },
    { name: "Fruta (banana)", kcal: 100, p: 1, c: 25, f: 0, tags: ["higher_sugar"] },
  ],
  almuerzo: [
    { name: "Pechuga de pollo con arroz integral", kcal: 450, p: 35, c: 50, f: 8, tags: ["meat","higher_carb"] },
    { name: "Merluza al horno con puré de calabaza", kcal: 420, p: 30, c: 45, f: 10, tags: ["fish"] },
    { name: "Bowl de garbanzos y verduras", kcal: 460, p: 18, c: 60, f: 12, tags: ["vegetarian","gluten_free"] },
    { name: "Carne magra con ensalada (baja sal)", kcal: 480, p: 35, c: 10, f: 25, tags: ["meat","low_sodium_option"] },
    { name: "Pasta sin gluten con salsa natural", kcal: 520, p: 12, c: 80, f: 10, tags: ["gluten_free","vegetarian","higher_carb"] },
    { name: "Quinoa con verduras", kcal: 430, p: 14, c: 55, f: 14, tags: ["vegetarian","gluten_free"] },
  ],
  cena: [
    { name: "Ensalada con atún", kcal: 300, p: 25, c: 10, f: 15, tags: ["fish","protein_rich"] },
    { name: "Tortilla de verduras", kcal: 260, p: 12, c: 15, f: 14, tags: ["vegetarian"] },
    { name: "Salmón grillado con brócoli", kcal: 380, p: 30, c: 10, f: 22, tags: ["fish","protein_rich"] },
    { name: "Arroz integral con tofu y vegetales", kcal: 420, p: 18, c: 50, f: 14, tags: ["vegetarian","gluten_free"] },
    { name: "Pollo al horno (sin sal) con batata", kcal: 400, p: 30, c: 40, f: 10, tags: ["meat","low_sodium_option"] },
  ],
  colacion: [
    { name: "Frutos secos (30g)", kcal: 180, p: 5, c: 6, f: 16, tags: ["higher_fat"] },
    { name: "Yogur griego", kcal: 100, p: 10, c: 8, f: 0, tags: ["dairy","protein_rich"] },
    { name: "Yogur vegetal (sin lactosa)", kcal: 90, p: 5, c: 10, f: 3, tags: ["dairy_free"] },
    { name: "Manzana verde", kcal: 70, p: 0, c: 18, f: 0, tags: ["low_sugar"] },
    { name: "Barra integral sin gluten", kcal: 150, p: 4, c: 25, f: 5, tags: ["gluten_free"] },
    { name: "Palitos de verduras con hummus", kcal: 120, p: 4, c: 12, f: 7, tags: ["vegetarian","low_sodium_option"] },
  ],
};

const SUBSTITUTIONS = {
  lactosa: {
    exact: {
      "Avena con leche": "Avena con bebida vegetal (sin lactosa)",
      "Yogur natural": "Yogur vegetal (sin lactosa)",
      "Yogur griego": "Yogur vegetal (sin lactosa)",
    },
    preferTags: ["dairy_free"],
    avoidTags: ["dairy"]
  },
  celiaca: {
    exact: {
      "Tostadas integrales con palta": "Tostadas sin gluten con palta",
    },
    preferTags: ["gluten_free"],
    avoidTags: ["gluten"]
  },
  diabetes: {
    exact: {},
    preferTags: ["low_sugar","protein_rich"],
    avoidTags: ["higher_sugar"]
  },
  hipertension: {
    exact: {},
    preferTags: ["low_sodium_option"],
    avoidTags: ["high_sodium_possible"]
  },
  vegetariano: {
    exact: {},
    preferTags: ["vegetarian"],
    avoidTags: ["meat","fish"]
  },
  vegano: {
    exact: {},
    preferTags: ["vegan","vegetarian"],
    avoidTags: ["meat","fish","dairy","egg"]
  }
};

/* ---------- LOGIC HELPERS (COPIADOS DEL FORM) ---------- */
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const containsAny = (haystack = [], needles = []) => {
  return needles.some(n => haystack.includes(n));
};

const normalizeDays = (days) => {
    const options = [3,5,7];
    if (!days || isNaN(days)) return 7;
    let best = options[0], bestDiff = Math.abs(days - options[0]);
    options.forEach(o => {
      const d = Math.abs(days - o);
      if (d < bestDiff) { best = o; bestDiff = d; }
    });
    return best;
};

// --- Logic: Select Food ---
const getSafeFoodForConditions = (food, mealKey, conds) => {
    if (!conds || conds.length === 0) return { food, modified: false };
    const tags = food.tags || [];
    let conflicts = conds.some(cond => {
      const rule = SUBSTITUTIONS[cond];
      if (!rule) return false;
      return containsAny(tags, rule.avoidTags || []);
    });
    if (!conflicts) return { food, modified: false };
    
    // 1. Exact
    for (const cond of conds) {
      const rule = SUBSTITUTIONS[cond];
      if (!rule) continue;
      const exactMap = rule.exact || {};
      if (exactMap[food.name]) {
        const targetName = exactMap[food.name];
        const all = Object.values(FOOD_POOLS).flat();
        const found = all.find(f => f.name === targetName);
        if (found) return { food: found, modified: true, reason: `Sustituido por ${cond}` };
      }
    }
    // 2. Prefer tags
    for (const cond of conds) {
      const rule = SUBSTITUTIONS[cond];
      if (!rule) continue;
      const prefer = rule.preferTags || [];
      if (prefer.length) {
        const sameMeal = FOOD_POOLS[mealKey] || [];
        const candidate = sameMeal.find(f => containsAny(f.tags, prefer) && !conds.some(c => containsAny(f.tags, SUBSTITUTIONS[c]?.avoidTags || [])));
        if (candidate) return { food: candidate, modified: true, reason: `Sustituido por ${cond}` };
      }
    }
    // 3. Fallback
    for (const cond of conds) {
      const rule = SUBSTITUTIONS[cond];
      const prefer = rule?.preferTags || [];
      const all = Object.values(FOOD_POOLS).flat();
      if (prefer.length) {
        const candidate = all.find(f => containsAny(f.tags, prefer) && !conds.some(c => containsAny(f.tags, SUBSTITUTIONS[c]?.avoidTags || [])));
        if (candidate) return { food: candidate, modified: true, reason: `Sustituido por ${cond}` };
      }
      const candidate2 = all.find(f => !conds.some(c => containsAny(f.tags, SUBSTITUTIONS[c]?.avoidTags || [])));
      if (candidate2) return { food: candidate2, modified: true, reason: `Sustituido por ${cond}` };
    }
    return { food, modified: true, reason: "Sustitución forzada" };
};

const pickItemsForMeal = (mealKey, count, conds, usedToday) => {
    const pool = FOOD_POOLS[mealKey] ? shuffle(FOOD_POOLS[mealKey].slice()) : [];
    const selected = [];
    let i = 0;
    while (selected.length < count && i < pool.length) {
      const candidate = pool[i++];
      const resolved = getSafeFoodForConditions(candidate, mealKey, conds);
      if (selected.some(s => s.food.name === resolved.food.name)) continue;
      if (usedToday.has(resolved.food.name)) continue;
      selected.push(resolved);
      usedToday.add(resolved.food.name);
    }
    // Relleno
    if (selected.length < count) {
       const poolAll = FOOD_POOLS[mealKey] || [];
       let j = 0;
       while (selected.length < count && j < poolAll.length) {
         const candidate = poolAll[j++];
         const resolved = getSafeFoodForConditions(candidate, mealKey, conds);
         if (selected.some(s => s.food.name === resolved.food.name)) continue;
         if (usedToday.has(resolved.food.name)) continue;
         selected.push(resolved);
         usedToday.add(resolved.food.name);
       }
    }
    return selected;
};

const createPlan = (conds, daysNum) => {
    const plan = {};
    const names = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    const countsByMeal = { desayuno: 2, almuerzo: 2, cena: 2, colacion: 2 };
    
    for (let d = 0; d < daysNum; d++) {
      const dayName = names[d % 7];
      const usedToday = new Set();
      const desayuno = pickItemsForMeal("desayuno", countsByMeal.desayuno, conds, usedToday);
      const almuerzo = pickItemsForMeal("almuerzo", countsByMeal.almuerzo, conds, usedToday);
      const cena = pickItemsForMeal("cena", countsByMeal.cena, conds, usedToday);
      const colaciones = pickItemsForMeal("colacion", countsByMeal.colacion, conds, usedToday);
      
      plan[dayName] = { desayuno, almuerzo, cena, colaciones };
    }
    return plan;
};

/* ---------- COMPONENT ---------- */
const NutritionPlan = () => {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null); // Estructura: { Lunes: {...}, Martes: {...} }
  const [stats, setStats] = useState({ kcal: 0, p: 0, c: 0, f: 0, pPct: 0, cPct: 0, fPct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Day viewer
  const [dayKeys, setDayKeys] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);

  // Refs para gráficos
  const proteinRoot = useRef(null);
  const carbsRoot = useRef(null);
  const fatRoot = useRef(null);

  // 1. Cargar datos desde CRM
  useEffect(() => {
    const fetchDiet = async () => {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      if (!userData?.isAuthenticated) {
        navigate("/login");
        return;
      }
      const token = userData.token || localStorage.getItem("crmToken");
      
      try {
        // Traemos TODOS y tomamos el último para asegurar sincronía
        const res = await fetch(`${CRM_BASE}/api/diet-states/client/${TEST_CLIENT_ID}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
            if (res.status === 404) throw new Error("No hay dieta creada. Ve al generador.");
            throw new Error("Error de conexión.");
        }

        const list = await res.json();
        if (!Array.isArray(list) || list.length === 0) {
            throw new Error("No hay historial de dieta.");
        }

        const lastState = list[list.length - 1]; // El último guardado
        
        // 2. Parsear condiciones y regenerar el plan IDENTICO al form
        let conds = [];
        let daysArg = 7;
        
        try {
            const json = JSON.parse(lastState.conditionsJson || "{}");
            conds = json.intolerancias || [];
        } catch(e) {}

        daysArg = normalizeDays(lastState.dietDays || 7);

        // GENERAR PLAN (Misma función que el Form)
        const generated = createPlan(conds, daysArg);
        const keys = Object.keys(generated);
        
        setPlanData(generated);
        setDayKeys(keys);

        // 3. Calcular Macros Promedio para los Gráficos
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
        let dayCount = 0;

        Object.values(generated).forEach(dayMeals => {
            dayCount++;
            ["desayuno","almuerzo","cena","colaciones"].forEach(m => {
                dayMeals[m].forEach(item => {
                    totalKcal += (item.food.kcal || 0);
                    totalP += (item.food.p || 0);
                    totalC += (item.food.c || 0);
                    totalF += (item.food.f || 0);
                });
            });
        });

        const avgKcal = Math.round(totalKcal / dayCount);
        const avgP = Math.round(totalP / dayCount);
        const avgC = Math.round(totalC / dayCount);
        const avgF = Math.round(totalF / dayCount);

        // Porcentajes
        const totalGrams = avgP + avgC + avgF; 
        // (Esto es simplificado por gramos, para kcal exactas sería p*4 + c*4 + f*9)
        const calP = avgP * 4;
        const calC = avgC * 4;
        const calF = avgF * 9;
        const totalEnergy = calP + calC + calF || 1;

        setStats({
            kcal: avgKcal,
            p: avgP, c: avgC, f: avgF,
            pPct: Math.round((calP / totalEnergy) * 100),
            cPct: Math.round((calC / totalEnergy) * 100),
            fPct: Math.round((calF / totalEnergy) * 100)
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiet();
  }, [navigate]);

  // 2. Render Charts
  useLayoutEffect(() => {
    if (loading || !stats.kcal) return;
    
    const createRing = (ref, divId, color, percentage, restColor) => {
      if (ref.current) {
        try { ref.current.dispose(); } catch (e) {}
      }
      const root = am5.Root.new(divId);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5percent.PieChart.new(root, { layout: root.verticalLayout, innerRadius: am5.percent(60) })
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
      series.slices.template.setAll({ stroke: am5.color(0xffffff), strokeWidth: 2, templateField: "fill" });
      series.slices.each((slice, index) => {
        if (data[index].fill) slice.set("fill", data[index].fill);
      });
      series.appear(1000, 100);
      ref.current = root;
    };

    createRing(proteinRoot, "proteinRing", "#4CAF50", stats.pPct, "#C8E6C9");
    createRing(carbsRoot, "carbsRing", "#FF9800", stats.cPct, "#FFE0B2");
    createRing(fatRoot, "fatRing", "#2196F3", stats.fPct, "#BBDEFB");

    return () => {
      [proteinRoot, carbsRoot, fatRoot].forEach((r) => {
        try { r.current?.dispose(); r.current = null; } catch (e) {}
      });
    };
  }, [loading, stats]);

  // Navigation logic
  const handlePrev = () => {
    setViewIndex(prev => (prev - 1 + dayKeys.length) % dayKeys.length);
  };
  const handleNext = () => {
    setViewIndex(prev => (prev + 1) % dayKeys.length);
  };

  if (loading) return <div className="nutrition-container"><h3 style={{ color: 'white' }}>Cargando tu plan...</h3></div>;
  if (error) return (
    <div className="nutrition-container">
      <h3 style={{ color: '#ff8a80', marginBottom: '20px' }}>{error}</h3>
      <button className="btn-primary" onClick={() => navigate('/generador-dieta')}>Ir al Generador</button>
    </div>
  );
  if (!planData) return null;

  const currentDayName = dayKeys[viewIndex];
  const currentMeals = planData[currentDayName];

  return (
    <div className="nutrition-container">
      <div data-aos="fade-in" className="title">
        <h2 className="mainTitle">Plan Nutricional</h2>
        <p>Promedio Diario: {stats.kcal} kcal</p>
      </div>

      {/* Selector de Día */}
      <div className="diet-day-bar" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, justifyContent: "center" }}>
        <button onClick={handlePrev} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#333", color: "white", cursor: "pointer" }}>◀</button>
        <div style={{ minWidth: 180, textAlign: "center" }}>
          <strong style={{ fontSize: "1.2rem", color: "#FF9800" }}>{currentDayName}</strong>
          <div style={{ fontSize: 12, color: "#bbb" }}>Día {viewIndex + 1} de {dayKeys.length}</div>
        </div>
        <button onClick={handleNext} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#333", color: "white", cursor: "pointer" }}>▶</button>
      </div>

      {/* Charts */}
      <section data-aos="fade-in" className="chart-section boxShadowSection nutricionSection2">
        <h3>Distribución de Macros (Estimado)</h3>
        <div className="macros-container">
          <div className="macro-item">
            <div id="proteinRing" className="macro-ring" style={{ height: '120px', width: '120px' }}>
              <span style={{ color: "#4CAF50" }} className="ratio">{stats.pPct}%</span>
            </div>
            <p className="macro-label protein">Proteínas</p>
            <p className="macro-restante">~{stats.p}g</p>
          </div>
          <div className="macro-item">
            <div id="carbsRing" className="macro-ring" style={{ height: '120px', width: '120px' }}>
              <span style={{ color: "#FF9800" }} className="ratio">{stats.cPct}%</span>
            </div>
            <p className="macro-label carbs">Carbos</p>
            <p className="macro-restante">~{stats.c}g</p>
          </div>
          <div className="macro-item">
            <div id="fatRing" className="macro-ring" style={{ height: '120px', width: '120px' }}>
              <span style={{ color: "#2196F3" }} className="ratio">{stats.fPct}%</span>
            </div>
            <p className="macro-label fat">Grasas</p>
            <p className="macro-restante">~{stats.f}g</p>
          </div>
        </div>
      </section>

      {/* Lista de comidas del día seleccionado */}
      <div className="dietaContainer">
        {["desayuno", "almuerzo", "cena", "colaciones"].map((mealKey) => (
             <div key={mealKey} data-aos="fade-up" className="meal-card">
                <h3 className="meal-title" style={{ textTransform: "capitalize" }}>{mealKey}</h3>
                <ul className="meal-list">
                    {currentMeals[mealKey].map((item, idx) => (
                        <li className="meal-item" key={idx} style={{ borderLeft: item.modified ? "4px solid orange" : "4px solid transparent" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span className="food-name">{item.food.name}</span>
                                {item.modified && <span style={{ fontSize: "0.7rem", color: "orange" }}> (Sustitución por condición)</span>}
                            </div>
                            <span className="food-macros">
                                {item.food.kcal} kcal | P: {item.food.p}g | C: {item.food.c}g | G: {item.food.f}g
                            </span>
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