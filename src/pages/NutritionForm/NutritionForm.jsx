import React, { useState } from "react";
import "./NutritionForm.css";
import { useNavigate } from "react-router-dom";
// 👉 Importamos tu cliente de Supabase
import { supabase } from "../../supabaseClient"; 
import { FiInfo, FiCheckCircle } from "react-icons/fi";

/* ---------- POOLS (Alimentos y Macros) ---------- */
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
  lactosa: { exact: { "Avena con leche": "Avena con bebida vegetal (sin lactosa)", "Yogur natural": "Yogur vegetal (sin lactosa)", "Yogur griego": "Yogur vegetal (sin lactosa)" }, preferTags: ["dairy_free"], avoidTags: ["dairy"] },
  celiaca: { exact: { "Tostadas integrales con palta": "Tostadas sin gluten con palta" }, preferTags: ["gluten_free"], avoidTags: ["gluten"] },
  diabetes: { exact: {}, preferTags: ["low_sugar","protein_rich"], avoidTags: ["higher_sugar"] },
  hipertension: { exact: {}, preferTags: ["low_sodium_option"], avoidTags: ["high_sodium_possible"] },
  vegetariano: { exact: {}, preferTags: ["vegetarian"], avoidTags: ["meat","fish"] },
  vegano: { exact: {}, preferTags: ["vegan","vegetarian"], avoidTags: ["meat","fish","dairy","egg"] }
};

/* ---------- LOGIC HELPERS ---------- */
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const containsAny = (haystack = [], needles = []) => needles.some(n => haystack.includes(n));

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

const getSafeFoodForConditions = (food, mealKey, conds, warnSet) => {
  if (!conds || conds.length === 0) return { food, modified: false, reason: null };
  const tags = food.tags || [];
  let conflicts = conds.some(cond => {
    const rule = SUBSTITUTIONS[cond];
    if (!rule) return false;
    return containsAny(tags, rule.avoidTags || []);
  });
  if (!conflicts) return { food, modified: false, reason: null };
  
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
  warnSet.add(`No se encontró sustituto ideal para "${food.name}" en ${mealKey}.`);
  return { food, modified: true, reason: `Usar con precaución` };
};

const pickItemsForMeal = (mealKey, count, conds, usedToday, warnSet) => {
  const pool = FOOD_POOLS[mealKey] ? shuffle(FOOD_POOLS[mealKey].slice()) : [];
  const selected = [];
  let i = 0;
  while (selected.length < count && i < pool.length) {
    const candidate = pool[i++];
    const resolved = getSafeFoodForConditions(candidate, mealKey, conds, warnSet);
    if (selected.some(s => s.food.name === resolved.food.name)) continue;
    if (usedToday.has(resolved.food.name)) continue;
    selected.push(resolved);
    usedToday.add(resolved.food.name);
  }
  if (selected.length < count) {
     const poolAll = FOOD_POOLS[mealKey] || [];
     let j = 0;
     while (selected.length < count && j < poolAll.length) {
       const candidate = poolAll[j++];
       const resolved = getSafeFoodForConditions(candidate, mealKey, conds, warnSet);
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
  const warnSet = new Set();
  const names = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const countsByMeal = { desayuno: 2, almuerzo: 2, cena: 2, colacion: 2 };
  for (let d = 0; d < daysNum; d++) {
    const dayName = names[d % 7];
    const usedToday = new Set();
    const desayuno = pickItemsForMeal("desayuno", countsByMeal.desayuno, conds, usedToday, warnSet);
    const almuerzo = pickItemsForMeal("almuerzo", countsByMeal.almuerzo, conds, usedToday, warnSet);
    const cena = pickItemsForMeal("cena", countsByMeal.cena, conds, usedToday, warnSet);
    const colaciones = pickItemsForMeal("colacion", countsByMeal.colacion, conds, usedToday, warnSet);
    plan[dayName] = { desayuno, almuerzo, cena, colaciones };
  }
  return { plan, warnings: Array.from(warnSet) };
};

/* ---------- Componente Principal ---------- */
export default function NutritionForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    objetivo: "", peso: "", nivelActividad: "", dias: "7", sexo: "", altura: ""      
  });

  const [hasConditions, setHasConditions] = useState("no");
  const [conditions, setConditions] = useState([]); 
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  // Estados de guardado Supabase
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCondition = (condId) => {
    if (conditions.includes(condId)) {
      setConditions(conditions.filter(c => c !== condId));
    } else {
      setConditions([...conditions, condId]);
    }
  };

  // --- LÓGICA DE GUARDADO EN SUPABASE (Adaptada a tu diagrama) ---
  const handleGenerate = async (e) => {
    e?.preventDefault();
    setWarnings([]);
    setGeneratedPlan(null);
    setSaveFeedback(null);
    setSaving(true);

    const daysNum = normalizeDays(Number(formData.dias || 7));
    const conds = hasConditions === "si" ? conditions.filter(Boolean) : [];
    const { plan, warnings } = createPlan(conds, daysNum);
    
    setGeneratedPlan(plan);
    setWarnings(warnings);

    try {
      // 1. Obtener ID del usuario logueado
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;

      if (!userId) {
        setSaveFeedback({ type: 'error', text: "Error: Tu sesión expiró o no estás logueado." });
        setSaving(false);
        return;
      }

      // 2. Desactivar planes anteriores para que este sea el principal
      await supabase
        .from('diet_plans')
        .update({ is_active: false })
        .eq('user_id', userId);

      // 3. Crear nuevo plan en `diet_plans`
      const { data: newPlan, error: planError } = await supabase
        .from('diet_plans')
        .insert({
          user_id: userId,
          is_active: true,
          start_date: new Date().toISOString().split('T')[0] // Fecha YYYY-MM-DD
        })
        .select()
        .single();

      if (planError) throw planError;

      // 4. Preparar e insertar las comidas diarias en `daily_meals`
      // Aquí usamos JSON.stringify para que `NutritionPlan` pueda leer los macros perfectamente
      const dailyMealsToInsert = Object.entries(plan).map(([dayName, meals]) => ({
        diet_plan_id: newPlan.id,
        day_name: dayName,
        breakfast: JSON.stringify(meals.desayuno),
        lunch: JSON.stringify(meals.almuerzo),
        snack: JSON.stringify(meals.colaciones),
        dinner: JSON.stringify(meals.cena)
      }));

      const { error: mealsError } = await supabase
        .from('daily_meals')
        .insert(dailyMealsToInsert);

      if (mealsError) throw mealsError;

      setSaveFeedback({ type: 'success', text: "¡Dieta generada y guardada exitosamente!" });

    } catch (error) {
      console.error("Error guardando dieta en Supabase:", error);
      setSaveFeedback({ type: 'error', text: "Hubo un error al guardar en la base de datos." });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setFormData({ objetivo: "", peso: "", nivelActividad: "", dias: "7", sexo: "", altura: "" });
    setHasConditions("no");
    setConditions([]);
    setGeneratedPlan(null);
    setWarnings([]);
    setSaveFeedback(null);
  };

  return (
    <div className="dashboard-container nutrition-form-wrapper">
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Creación de plan</p>
          <h1 className="user-name">Generador de Dieta</h1>
        </div>
      </header>

      {/* 🔹 FORMULARIO (Bento Card) */}
      <section className="bento-card slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="card-title">Tus Datos Físicos</h2>
        <form className="glass-form" onSubmit={(e)=>e.preventDefault()}>
          
          <div className="form-group">
            <label>Sexo biológico</label>
            <select className="glass-select" name="sexo" value={formData.sexo} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div className="form-group">
            <label>Altura (cm)</label>
            <input className="glass-input" type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 175" />
          </div>

          <div className="form-group">
            <label>Peso corporal (kg)</label>
            <input className="glass-input" type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 75" />
          </div>

          <div className="form-group">
            <label>Objetivo Principal</label>
            <select className="glass-select" name="objetivo" value={formData.objetivo} onChange={handleChange}>
              <option value="">Seleccionar objetivo...</option>
              <option value="definicion">Definición (Perder Grasa)</option>
              <option value="volumen">Volumen (Ganar Músculo)</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nivel de Actividad Física</label>
            <select className="glass-select" name="nivelActividad" value={formData.nivelActividad} onChange={handleChange}>
              <option value="">Seleccionar nivel...</option>
              <option value="bajo">Bajo (Sedentario)</option>
              <option value="moderado">Moderado (Entreno 3-4 veces)</option>
              <option value="alto">Alto (Entreno 5+ veces / Trabajo físico)</option>
            </select>
          </div>

          <div className="form-group">
            <label>¿Tenés intolerancias o condiciones?</label>
            <select className="glass-select" value={hasConditions} onChange={(e)=>setHasConditions(e.target.value)}>
              <option value="no">No, como de todo</option>
              <option value="si">Sí, necesito adaptar el menú</option>
            </select>
          </div>

          {hasConditions === "si" && (
            <div className="lesiones-container slide-up">
              <label className="subtitle-label">Selecciona tus condiciones (toca para activar):</label>
              <div className="chips-grid">
                {[
                  { id: "lactosa", label: "Intolerancia a la Lactosa" },
                  { id: "celiaca", label: "Celiaquía (Gluten)" },
                  { id: "diabetes", label: "Diabetes" },
                  { id: "hipertension", label: "Hipertensión" },
                  { id: "vegetariano", label: "Vegetariano" },
                  { id: "vegano", label: "Vegano" }
                ].map((cond) => {
                  const isActive = conditions.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      className={`chip-btn ${isActive ? "active" : ""}`}
                      onClick={() => toggleCondition(cond.id)}
                    >
                      {cond.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Estructura del plan</label>
            <select className="glass-select" name="dias" value={formData.dias} onChange={handleChange}>
              <option value="3">3 días (Menú simple)</option>
              <option value="5">5 días (Lunes a Viernes)</option>
              <option value="7">7 días (Semana completa)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClear}>Limpiar</button>
            <button type="button" className="btn-primary generate-btn" onClick={handleGenerate} disabled={saving}>
              {saving ? "Procesando..." : "Generar y Guardar"}
            </button>
          </div>

          {/* Feedback de Guardado */}
          {saveFeedback && (
            <div className={`save-feedback ${saveFeedback.type} slide-up`}>
              {saveFeedback.type === 'success' ? <FiCheckCircle /> : <FiInfo />}
              <span>{saveFeedback.text}</span>
            </div>
          )}
        </form>
      </section>

      {/* 🔹 RESULTADOS DE LA DIETA */}
      {generatedPlan && (
        <div className="rutina-resultados-container slide-up" style={{ animationDelay: "0.2s" }}>
          
          <div className="resultados-header">
            <h2 className="section-title">Tu Nuevo Menú</h2>
          </div>

          {warnings.length > 0 && (
            <div className="warning-card">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Notas sobre el menú:</strong>
                <ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            </div>
          )}

          <div className="rutina-dias-grid">
            {Object.entries(generatedPlan).map(([dia, meals], di) => (
              <section key={dia} className="bento-card dia-card slide-up" style={{ animationDelay: `${0.3 + (di * 0.1)}s` }}>
                <div className="dia-header">
                  <h3>{dia}</h3>
                </div>
                
                <div className="dia-body">
                  {["desayuno","almuerzo","colaciones","cena"].map(m => (
                    <div key={m} className="grupo-muscular">
                      <h4 className="grupo-title">{m}</h4>
                      <ul className="ejercicios-list">
                        {meals[m].map((it, i) => (
                          <li key={i} className={it.modified ? "ejercicio-item modified" : "ejercicio-item"}>
                            <div className="ejercicio-info">
                              <span className="ejercicio-name">{it.food.name}</span>
                              <span className="ejercicio-details">Aprox. {it.food.kcal} kcal</span>
                            </div>
                            {it.modified && <span className="badge-sust">SUST</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Botón Volver */}
      <div className="back-action slide-up" style={{ animationDelay: "0.8s" }}>
        <button type="button" className="btn-secondary outline" onClick={() => navigate("/")}>
          Volver al Inicio
        </button>
      </div>

    </div>
  );
}