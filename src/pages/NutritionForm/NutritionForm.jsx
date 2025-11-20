// NutritionForm.jsx
import React, { useState, useEffect } from "react";
import "./NutritionForm.css";
import { useNavigate } from "react-router-dom";

/* ---------- CONFIG CRM ---------- */
const CRM_BASE = "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net";
const TEST_CLIENT_ID = 1; 

/* ---------- POOLS (Sin cambios) ---------- */
const FOOD_POOLS = {
  desayuno: [
    { name: "Avena con leche", kcal: 300, tags: ["dairy","higher_carb"] },
    { name: "Avena con bebida vegetal (sin lactosa)", kcal: 290, tags: ["dairy_free","higher_carb"] },
    { name: "Yogur natural", kcal: 110, tags: ["dairy"] },
    { name: "Yogur vegetal (sin lactosa)", kcal: 100, tags: ["dairy_free"] },
    { name: "Tostadas integrales con palta", kcal: 320, tags: ["gluten"] },
    { name: "Tostadas sin gluten con palta", kcal: 330, tags: ["gluten_free"] },
    { name: "Huevos revueltos", kcal: 200, tags: ["protein_rich"] },
    { name: "Omelette de claras con espinaca", kcal: 150, tags: ["protein_rich","low_carb"] },
    { name: "Fruta (manzana)", kcal: 80, tags: ["low_sugar"] },
    { name: "Fruta (banana)", kcal: 100, tags: ["higher_sugar"] },
  ],
  almuerzo: [
    { name: "Pechuga de pollo con arroz integral", kcal: 450, tags: ["meat","higher_carb"] },
    { name: "Merluza al horno con puré de calabaza", kcal: 420, tags: ["fish"] },
    { name: "Bowl de garbanzos y verduras", kcal: 460, tags: ["vegetarian","gluten_free"] },
    { name: "Carne magra con ensalada (baja sal)", kcal: 480, tags: ["meat","low_sodium_option"] },
    { name: "Pasta sin gluten con salsa natural", kcal: 520, tags: ["gluten_free","vegetarian","higher_carb"] },
    { name: "Quinoa con verduras", kcal: 430, tags: ["vegetarian","gluten_free"] },
  ],
  cena: [
    { name: "Ensalada con atún", kcal: 300, tags: ["fish","protein_rich"] },
    { name: "Tortilla de verduras", kcal: 260, tags: ["vegetarian"] },
    { name: "Salmón grillado con brócoli", kcal: 380, tags: ["fish","protein_rich"] },
    { name: "Arroz integral con tofu y vegetales", kcal: 420, tags: ["vegetarian","gluten_free"] },
    { name: "Pollo al horno (sin sal) con batata", kcal: 400, tags: ["meat","low_sodium_option"] },
  ],
  colacion: [
    { name: "Frutos secos (30g)", kcal: 180, tags: ["higher_fat"] },
    { name: "Yogur griego", kcal: 100, tags: ["dairy","protein_rich"] },
    { name: "Yogur vegetal (sin lactosa)", kcal: 90, tags: ["dairy_free"] },
    { name: "Manzana verde", kcal: 70, tags: ["low_sugar"] },
    { name: "Barra integral sin gluten", kcal: 150, tags: ["gluten_free"] },
    { name: "Palitos de verduras con hummus", kcal: 120, tags: ["vegetarian","low_sodium_option"] },
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

/* ---------- Componente ---------- */
export default function NutritionForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    objetivo: "",
    peso: "",
    nivelActividad: "",
    dias: "7",
    sexo: "",        
    altura: ""      
  });

  const [hasConditions, setHasConditions] = useState("no");
  const [conditions, setConditions] = useState([]); 
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const getAuthToken = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      return userData?.token || localStorage.getItem("crmToken") || "";
    } catch (e) { return ""; }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!userData?.isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [navigate]);

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

  const addCondition = () => setConditions(prev => [...prev, ""]);
  const updateCondition = (i, val) => setConditions(prev => prev.map((c, idx) => idx === i ? val : c));
  const removeCondition = (i) => setConditions(prev => prev.filter((_, idx) => idx !== i));
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------
     SIMPLE POST SAVE
  --------------------------------------------------------- */
  const saveDietState = async (payload) => {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${CRM_BASE}/api/diet-states`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      
      // --- MENSAJE EN CONSOLA SOLICITADO ---
      console.log("✅ DIETA GUARDADA EXITOSAMENTE EN DB. JSON ENVIADO:", payload);
      // -------------------------------------

      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  };

  // --- Generación ---
  const handleGenerate = async (e) => {
    e?.preventDefault();
    setWarnings([]);
    setGeneratedPlan(null);
    setSaveFeedback(null);

    const daysNum = normalizeDays(Number(formData.dias || 7));
    if (![3,5,7].includes(daysNum)) {
      setWarnings(["Selecciona 3, 5 o 7 días."]);
    }

    const conds = hasConditions === "si" ? conditions.filter(Boolean) : [];
    const { plan, warnings } = createPlan(conds, daysNum);
    setGeneratedPlan(plan);
    setWarnings(warnings);

    // Payload base
    const payload = {
      clientId: TEST_CLIENT_ID,
      goal: formData.objetivo || "Sin especificar",
      weightKg: Number(formData.peso) || 0,
      activityLevel: formData.nivelActividad || "",
      conditionsJson: JSON.stringify({
        intolerancias: conds,
        sexo: formData.sexo || "",
        alturaCm: formData.altura ? Number(formData.altura) : null
      }),
      dietDays: Number(formData.dias || 7)
    };

    setSaveFeedback("Guardando...");
    const saved = await saveDietState(payload);
    
    if (saved.ok) {
      setSaveFeedback(`Guardado con éxito (ID ${saved.data.id})`);
    } else {
      setSaveFeedback(`Error al guardar: ${saved.error}`);
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
    <div className="dietasContainer">
      <form className="form-dieta" onSubmit={(e)=>e.preventDefault()}>
        <h2>Crear Dieta</h2>

        <div className="campo-dieta">
          <label>Sexo:</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange}>
            <option value="">No especificado</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="campo-dieta">
          <label>Altura (cm):</label>
          <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 175" />
        </div>

        <div className="campo-dieta">
          <label>Objetivo:</label>
          <select name="objetivo" value={formData.objetivo} onChange={handleChange}>
            <option value="">Seleccionar objetivo</option>
            <option value="definicion">Definición</option>
            <option value="volumen">Volumen</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="campo-dieta">
          <label>Peso corporal (kg):</label>
          <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 75" />
        </div>

        <div className="campo-dieta">
          <label>Nivel de actividad física:</label>
          <select name="nivelActividad" value={formData.nivelActividad} onChange={handleChange}>
            <option value="">Seleccionar nivel</option>
            <option value="bajo">Bajo</option>
            <option value="moderado">Moderado</option>
            <option value="alto">Alto</option>
          </select>
        </div>

        <div className="campo-dieta">
          <label>¿Tenés alguna condición / intolerancia?</label>
          <select value={hasConditions} onChange={(e)=>setHasConditions(e.target.value)}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>

        {hasConditions === "si" && (
          <div className="campo-dieta">
            <label>Condiciones actuales:</label>
            {conditions.map((c, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <select value={c} onChange={(e)=>updateCondition(idx, e.target.value)}>
                  <option value="">Seleccionar condición</option>
                  <option value="lactosa">Intolerancia a la lactosa</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="celiaca">Celiaquía (gluten)</option>
                  <option value="hipertension">Hipertensión</option>
                  <option value="vegetariano">Vegetariano</option>
                  <option value="vegano">Vegano</option>
                </select>
                <button type="button" onClick={()=>removeCondition(idx)}>❌</button>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>
              <button type="button" onClick={addCondition}>+ Agregar otra condición</button>
            </div>
          </div>
        )}

        <div className="campo-dieta">
          <label>Días de la dieta:</label>
          <select name="dias" value={formData.dias} onChange={handleChange}>
            <option value="3">3 días</option>
            <option value="5">5 días</option>
            <option value="7">7 días</option>
          </select>
        </div>

        <div className="botones-dieta">
          <button type="button" onClick={handleGenerate}>Generar y Guardar</button>
          <button type="button" onClick={handleClear}>Limpiar</button>
        </div>
      </form>

      {/* Feedback */}
      {saveFeedback && (
        <div style={{ marginTop: 10, padding: 8, borderRadius: 4, 
             background: saveFeedback.includes("Error") ? "#fdecea" : "#eafaf1",
             color: saveFeedback.includes("Error") ? "#a54" : "#287", 
             border: `1px solid ${saveFeedback.includes("Error") ? "#f5c6cb" : "#c3e6cb"}` }}>
          {saveFeedback}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="form-rutina" style={{ marginTop: 12 }}>
          <h4>Advertencias / notas:</h4>
          <ul>
            {warnings.map((w, i) => <li key={i} style={{ color: "#a54" }}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Resultado */}
      {generatedPlan && (
        <div className="resultado-dieta" style={{ marginTop: 12 }}>
          <h2>Dieta Generada</h2>
          {Object.entries(generatedPlan).map(([dia, meals]) => (
            <div key={dia} className="dia-dieta">
              <h3>{dia}</h3>
              {["desayuno","almuerzo","cena","colaciones"].map(m => (
                <div key={m} className="meal-card">
                  <h4 style={{textTransform: "capitalize"}}>{m}</h4>
                  <ul className="meal-list">
                    {meals[m].map((it, i) => (
                      <li key={i} className={it.modified ? "modified-ex-row" : ""}>
                        <span className={it.modified ? "modified-ex" : ""}>
                          • {it.food.name} — {it.food.kcal} kcal {it.modified && `(${it.reason})`}
                        </span>
                        {it.modified && <span className="modified-badge">SUST.</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                
              ))}
            </div>
            
          ))}
        </div>
      
      )}
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#287",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
    
  );
}