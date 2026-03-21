import React, { useState, useEffect } from "react";
import "./RutinesForm.css";
import { useNavigate } from "react-router-dom";
// 👉 Importamos tu cliente de Supabase
import { supabase } from "../../supabaseClient"; 

export default function RoutinesForm() {
  const navigate = useNavigate();

  // ---------------------------
  // Estados básicos del formulario
  // ---------------------------
  const [edad, setEdad] = useState("");
  const [nivel, setNivel] = useState("principiante");
  const [dias, setDias] = useState(3);
  const [hasLesion, setHasLesion] = useState("no");
  const [lesiones, setLesiones] = useState([]);
  const [rutina, setRutina] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  // ---------------------------
  // Estados de guardado
  // ---------------------------
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const nivelMap = { principiante: "PRINCIPIANTE", intermedio: "INTERMEDIO", avanzado: "AVANZADO" };

  // ---------------------------
  // Pools, utilidades y lógica (Generación) - INTACTO
  // ---------------------------
  const pools = {
    pecho_sup: [
      { name: "Press inclinado con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Aperturas inclinadas con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Press inclinado en máquina", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    pecho_mid: [
      { name: "Press plano con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Press en máquina sentado", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Press plano con barra", joints: ["pecho","hombro"], riskyTags: ["barbell","axial_load"], equipment: "barra" },
    ],
    pecho_inf: [
      { name: "Press declinado en máquina", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Fondos asistidos", joints: ["pecho","hombro","codo"], riskyTags: ["bodyweight"], equipment: "bodyweight" },
    ],
    espalda_altas: [
      { name: "Jalón en polea", joints: ["espalda","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Remo sentado en máquina", joints: ["espalda","codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Remo con mancuerna", joints: ["espalda","codo"], riskyTags: [], equipment: "manc" },
    ],
    espalda_baja: [
      { name: "Remo con mancuerna apoyado", joints: ["espalda","codo"], riskyTags: [], equipment: "manc" },
      { name: "Extensiones suaves", joints: ["espalda"], riskyTags: ["extension","lumbar_load"], equipment: "bench" },
      { name: "Peso muerto rumano", joints: ["espalda","cadera"], riskyTags: ["lumbar_load","hip_hinge"], equipment: "barra" },
    ],
    quads: [
      { name: "Prensa de piernas", joints: ["rodilla","cadera"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Sentadilla con asistencia", joints: ["rodilla","cadera"], riskyTags: ["barbell","axial_load"], equipment: "barra" },
      { name: "Extensión de pierna", joints: ["rodilla"], riskyTags: ["isolation"], equipment: "maquina" },
    ],
    femorales_gluteos: [
      { name: "Puente de glúteos", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "manc" },
      { name: "Curl de piernas", joints: ["rodilla"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Subidas a banco", joints: ["rodilla","cadera"], riskyTags: [], equipment: "bodyweight" },
      { name: "Levantamiento isquiotibiales", joints: ["espalda","cadera"], riskyTags: ["lumbar_load","hip_hinge"], equipment: "barra" },
    ],
    gemelos: [
      { name: "Elevación sentado", joints: ["tobillo"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Elevación de pie", joints: ["tobillo"], riskyTags: [], equipment: "bodyweight" },
    ],
    deltoides: [
      { name: "Press con mancuernas", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Elevaciones laterales", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Face-pull", joints: ["hombro","escapula"], riskyTags: [], equipment: "cable" },
      { name: "Press tras nuca (evitar)", joints: ["hombro"], riskyTags: ["avoid","overhead_heavy"], equipment: "barra" },
    ],
    biceps: [
      { name: "Curl mancuerna", joints: ["codo"], riskyTags: [], equipment: "manc" },
      { name: "Curl martillo", joints: ["codo","antebrazo"], riskyTags: [], equipment: "manc" },
      { name: "Curl en máquina", joints: ["codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    triceps: [
      { name: "Extensión en polea", joints: ["codo"], riskyTags: ["machine_safe"], equipment: "cable" },
      { name: "Press cerrado", joints: ["codo","hombro"], riskyTags: ["barbell"], equipment: "barra" },
      { name: "Fondos asistidos", joints: ["codo","hombro"], riskyTags: ["bodyweight"], equipment: "bodyweight" },
    ],
    core: [
      { name: "Plancha rodillas", joints: ["core"], riskyTags: ["isometric"], equipment: "bodyweight" },
      { name: "Control abdominal", joints: ["core"], riskyTags: ["motor_control"], equipment: "bodyweight" },
      { name: "Extensión cuatro apoyos", joints: ["core","espalda"], riskyTags: ["motor_control"], equipment: "bodyweight" },
    ],
  };

  const safeByGroup = {
    espalda_baja: [{ name: "Remo en máquina", joints: ["espalda","codo"], riskyTags: ["machine_safe"], equipment: "maquina" }],
    pecho_sup: [{ name: "Press inclinado máquina", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" }],
    deltoides: [{ name: "Elevaciones laterales suaves", joints: ["hombro"], riskyTags: [], equipment: "manc" }],
    quads: [{ name: "Prensa de piernas corto", joints: ["rodilla","cadera"], riskyTags: ["machine_safe"], equipment: "maquina" }],
    femorales_gluteos: [{ name: "Puente glúteos", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "manc" }],
  };

  const safeGeneral = {
    rodilla: [{ name: "Bicicleta estática", joints: [], riskyTags: ["cardio_lowimpact"], equipment: "bike" }],
    espalda: [{ name: "Control abdominal", joints: ["core"], riskyTags: ["motor_control"], equipment: "bodyweight" }],
    hombro: [{ name: "Elevaciones laterales", joints: ["hombro"], riskyTags: [], equipment: "manc" }],
    codo: [{ name: "Curl con banda", joints: ["codo"], riskyTags: ["band"], equipment: "band" }],
    tobillo: [{ name: "Bicicleta estática", joints: [], riskyTags: ["cardio_lowimpact"], equipment: "bike" }],
  };

  const splits = {
    2: [
      ["pecho_mid","espalda_altas","quads","femorales_gluteos","deltoides","biceps","triceps","core"],
      ["pecho_sup","pecho_inf","espalda_baja","gemelos","deltoides","biceps","triceps","core"],
    ],
    3: [
      ["pecho_sup","pecho_mid","deltoides","triceps"],
      ["espalda_altas","espalda_baja","biceps","core"],
      ["quads","femorales_gluteos","gemelos"],
    ],
    4: [
      ["pecho_mid","espalda_altas","deltoides","biceps"],
      ["quads","femorales_gluteos","core","gemelos"],
      ["pecho_sup","espalda_baja","deltoides","triceps"],
      ["quads","femorales_gluteos","core","gemelos"],
    ],
    5: [
      ["pecho_sup","pecho_mid","deltoides"],
      ["espalda_altas","espalda_baja","biceps"],
      ["quads","femorales_gluteos","gemelos"],
      ["pecho_mid","espalda_altas","deltoides"],
      ["biceps","triceps","core"],
    ],
  };

  const capsPerFamilyDefault = { pecho: 3, espalda: 3, quads: 3, femorales_gluteos: 3, deltoides: 3, biceps: 2, triceps: 2, gemelos: 2, core: 2 };
  const weeklySetsBase = { principiante: 8, intermedio: 11, avanzado: 15 };

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const countSessions = (template) => {
    const counts = {};
    template.forEach(day => day.forEach(g => counts[g] = (counts[g] || 0) + 1));
    return counts;
  };

  const planForMuscle = (muscleKey, sessionsPerWeek, edadNum) => {
    let weeklyTarget = weeklySetsBase[nivel] || 10;
    if (edadNum >= 85) weeklyTarget = Math.round(weeklyTarget * 0.45);
    else if (edadNum >= 80) weeklyTarget = Math.round(weeklyTarget * 0.5);
    else if (edadNum >= 75) weeklyTarget = Math.round(weeklyTarget * 0.6);
    else if (edadNum >= 70) weeklyTarget = Math.round(weeklyTarget * 0.7);
    else if (edadNum >= 65) weeklyTarget = Math.round(weeklyTarget * 0.8);
    else if (edadNum >= 50) weeklyTarget = Math.round(weeklyTarget * 0.9);

    const setsPerSession = Math.max(1, Math.round(weeklyTarget / Math.max(1, sessionsPerWeek)));
    let setsPerExercise = 3;
    if (nivel === "principiante") setsPerExercise = 2;
    if (edadNum >= 75) setsPerExercise = Math.max(1, setsPerExercise - 1);
    const ejerciciosPorSesion = Math.max(1, Math.ceil(setsPerSession / setsPerExercise));
    const repsRange = edadNum >= 75 ? "8-15" : (nivel === "avanzado" ? "6-10" : "8-12");
    const rest = edadNum >= 75 ? "60-120s" : (nivel === "avanzado" ? "60-90s" : "60-120s");
    return { ejerciciosPorSesion, setsPerExercise, repsRange, rest, setsPerSession };
  };

  const groupKeywords = {
    pecho_sup: ["press","apertura","inclinado","banca"], pecho_mid: ["press","banca","apertura"], pecho_inf: ["press","declinado","fondos"],
    espalda_altas: ["remo","jalon","pull","row"], espalda_baja: ["remo","levantamiento","peso muerto","extensión","espalda"],
    quads: ["sentadilla","prensa","extensión","pierna"], femorales_gluteos: ["puente","hip","zancada","step","curl femoral"],
    gemelos: ["talon","gemelo","elevación"], deltoides: ["press","elevacion","lateral","hombro"],
    biceps: ["curl","martillo"], triceps: ["extensión","press cerrado","fondos"], core: ["plancha","abdominal","control","core"],
  };

  const toLower = (s = "") => s.toLowerCase();
  const isFunctionalRelevant = (ex, groupKey) => {
    const mainJointsByGroup = {
      pecho_sup: ["pecho","hombro"], pecho_mid: ["pecho","hombro"], pecho_inf: ["pecho","hombro"],
      espalda_altas: ["espalda","hombro"], espalda_baja: ["espalda","cadera"], quads: ["rodilla","cadera"],
      femorales_gluteos: ["cadera","rodilla","gluteo"], gemelos: ["tobillo"], deltoides: ["hombro"],
      biceps: ["codo"], triceps: ["codo"], core: ["core","espalda"],
    };
    const prim = mainJointsByGroup[groupKey] || [];
    if (Array.isArray(ex.joints) && ex.joints.some(j => prim.includes(j))) return true;
    const keywords = groupKeywords[groupKey] || [];
    const name = toLower(ex.name || "");
    if (keywords.some(k => name.includes(k))) return true;
    return false;
  };

  const avoidTagsByInjury = {
    rodilla: ["heavy_knee_flexion", "high_impact"],
    espalda: ["lumbar_load","hip_hinge","axial_load","extension","barbell"],
    hombro: ["overhead_heavy","internal_rotation","avoid"],
    codo: ["high_elbow_torque","barbell"],
    tobillo: ["high_impact"],
  };

  const filterByLesionsAndRelevance = (pool, lesionesArray = [], groupKey) => {
    let safe = pool.slice();
    safe = safe.filter(ex => {
      if (Array.isArray(ex.joints) && ex.joints.some(j => lesionesArray.includes(j))) return false;
      if (Array.isArray(ex.riskyTags) && lesionesArray.some(l => (avoidTagsByInjury[l] || []).some(t => ex.riskyTags.includes(t)))) return false;
      return true;
    });

    const relevant = safe.filter(ex => isFunctionalRelevant(ex, groupKey));
    let candidates = (relevant.length >= 2) ? shuffle(relevant) : shuffle(relevant.concat(safe.filter(s => !relevant.includes(s))));
    if (candidates.length < 2) {
      const groupAlts = safeByGroup[groupKey] || [];
      const groupAltsRelevant = groupAlts.filter(a => isFunctionalRelevant(a, groupKey));
      groupAltsRelevant.forEach(a => { if (!candidates.some(c => c.name === a.name)) candidates.push(a); });
    }
    if (candidates.length < 2 && lesionesArray.length > 0) {
      lesionesArray.forEach(l => {
        const gens = (safeGeneral[l] || []).filter(a => isFunctionalRelevant(a, groupKey));
        gens.forEach(g => { if (!candidates.some(c => c.name === g.name)) candidates.push(g); });
      });
    }
    if (candidates.length === 0) return pool.slice();
    const uniq = [];
    candidates.forEach(c => { if (!uniq.some(u => u.name === c.name)) uniq.push(c); });
    return uniq;
  };

  const generarRutina = async () => {
    setError("");
    setRutina([]);
    setWarnings([]);
    setSaveMessage("");

    const edadNum = parseInt(edad, 10);
    if (!edad || isNaN(edadNum) || edadNum < 15 || edadNum > 100) {
      setError("Ingresa una edad válida entre 15 y 100.");
      return;
    }
    
    const diasNum = Number(dias);
    if (!splits[diasNum]) {
      setError("Selecciona entre 2 y 5 días.");
      return;
    }

    const capsPerFamily = { ...capsPerFamilyDefault };
    if (edadNum >= 80) Object.keys(capsPerFamily).forEach(k => capsPerFamily[k] = Math.max(1, Math.floor(capsPerFamily[k] * 0.5)));
    else if (edadNum >= 70) Object.keys(capsPerFamily).forEach(k => capsPerFamily[k] = Math.max(1, Math.floor(capsPerFamily[k] * 0.75)));

    const template = splits[diasNum];
    const sessionsCount = countSessions(template);
    const dayNamesMap = { 
        2:["Lunes","Jueves"], 
        3:["Lunes","Miércoles","Viernes"], 
        4:["Lunes","Martes","Jueves","Viernes"], 
        5:["Lunes","Martes","Miércoles","Jueves","Viernes"] 
    };
    const dayNames = dayNamesMap[diasNum];

    const resultado = [];
    const warnSet = new Set();
    const usedExerciseCountWeek = {};
    const maxPerWeek = 2;
    const lesionesValidas = hasLesion === "si" ? lesiones.filter(l => l) : [];

    template.forEach((dayGroups, dIdx) => {
      const dayName = dayNames[dIdx] || `Día ${dIdx+1}`;
      const gruposHoy = [];
      const familyCountToday = {};
      const usedThisDay = new Set();

      dayGroups.forEach((gKey) => {
        const pool = pools[gKey];
        if (!pool) return;

        const sessionsPerWeek = sessionsCount[gKey] || 1;
        const plan = planForMuscle(gKey, sessionsPerWeek, edadNum);
        const candidates = (lesionesValidas.length > 0) ? filterByLesionsAndRelevance(pool, lesionesValidas, gKey) : shuffle(pool.slice());

        if (lesionesValidas.length > 0 && candidates.length && candidates.every(c => pool.some(p => p.name === c.name))) {
          const poolHadRisk = pool.some(ex => Array.isArray(ex.joints) && ex.joints.some(j => lesionesValidas.includes(j))
            || (Array.isArray(ex.riskyTags) && lesionesValidas.some(l => (avoidTagsByInjury[l] || []).some(t => ex.riskyTags.includes(t)))));
          if (poolHadRisk) warnSet.add(`Adaptado "${gKey.replace(/_/g," ")}" por lesión (${lesionesValidas.join(", ")}).`);
        }

        const family = (() => {
          if (gKey.startsWith("pecho")) return "pecho";
          if (gKey.startsWith("espalda")) return "espalda";
          if (gKey.startsWith("quads")) return "quads";
          if (gKey.startsWith("femorales")) return "femorales_gluteos";
          if (gKey.startsWith("gemelos")) return "gemelos";
          if (gKey.startsWith("deltoides")) return "deltoides";
          if (gKey.startsWith("biceps")) return "biceps";
          if (gKey.startsWith("triceps")) return "triceps";
          if (gKey.startsWith("core")) return "core";
          return gKey;
        })();

        const remainingCap = (capsPerFamily[family] || 2) - (familyCountToday[family] || 0);
        const take = Math.max(1, Math.min(plan.ejerciciosPorSesion, remainingCap));

        const selected = [];
        let ci = 0;
        const shuffledCandidates = shuffle(candidates.slice());

        while (selected.length < take && ci < shuffledCandidates.length) {
          const ex = shuffledCandidates[ci++];
          if (!ex || !ex.name) continue;
          if (usedThisDay.has(ex.name)) continue;
          if ((usedExerciseCountWeek[ex.name] || 0) >= maxPerWeek) continue;
          if (!isFunctionalRelevant(ex, gKey)) continue;

          const isFromOriginalPool = pool.some(p => p.name === ex.name);
          const modifiedFlag = (lesionesValidas.length > 0 && !isFromOriginalPool);

          selected.push({ name: ex.name, sets: plan.setsPerExercise, reps: plan.repsRange, rest: plan.rest, modified: modifiedFlag });
          usedThisDay.add(ex.name);
          usedExerciseCountWeek[ex.name] = (usedExerciseCountWeek[ex.name] || 0) + 1;
        }

        // Fallbacks por si faltaron ejercicios
        if (selected.length < take) {
          const fallbacks = [];
          if (safeByGroup[gKey] && safeByGroup[gKey].length) safeByGroup[gKey].forEach(s => fallbacks.push(s));
          lesionesValidas.forEach(l => { (safeGeneral[l] || []).forEach(s => fallbacks.push(s)); });
          const fallbackUniq = [];
          fallbacks.forEach(f => { if (!fallbackUniq.some(u => u.name === f.name)) fallbackUniq.push(f); });

          let fi = 0;
          while (selected.length < take && fi < fallbackUniq.length) {
            const ex = fallbackUniq[fi++];
            if (!ex || !ex.name || usedThisDay.has(ex.name) || (usedExerciseCountWeek[ex.name] || 0) >= maxPerWeek || !isFunctionalRelevant(ex, gKey)) continue;
            selected.push({ name: ex.name, sets: Math.max(1, plan.setsPerExercise - 1), reps: plan.repsRange, rest: plan.rest, note: "sustituto", modified: true });
            usedThisDay.add(ex.name);
            usedExerciseCountWeek[ex.name] = (usedExerciseCountWeek[ex.name] || 0) + 1;
          }
        }

        if (selected.length > 0) {
          familyCountToday[family] = (familyCountToday[family] || 0) + selected.length;
          gruposHoy.push({
            grupoLabel: gKey.replace(/_/g, " "),
            ejercicios: selected,
          });
        }
      });

      resultado.push({ dia: dayName, trabajo: gruposHoy });
    });

    setWarnings(Array.from(warnSet));
    setRutina(resultado);

    // ------------------------------------------------------------------
    // GUARDADO EN SUPABASE
    // ------------------------------------------------------------------
    (async () => {
      setSaving(true);
      setSaveMessage("Guardando y enviando a revisión...");

      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;

        if (!userId) {
          setSaveMessage("Error: Tu sesión expiró o no estás logueado.");
          setSaving(false);
          return;
        }

        // 👉 0. GUARDAR ALERTAS MÉDICAS (NUEVO)
        if (hasLesion === "si" && lesiones.length > 0) {
          
          // Primero borramos las alertas anteriores que pudiera tener para no duplicar data
          await supabase
            .from('medical_alerts')
            .delete()
            .eq('user_id', userId);

          // Armamos el array de alertas médicas a insertar
          const alertasToInsert = lesiones.map(zona => ({
            user_id: userId,
            name: `Lesión en ${zona.charAt(0).toUpperCase() + zona.slice(1)}`, // Ej: "Lesión en Hombro"
            severity: "Media", // 'Baja', 'Media', 'Alta' (La guardamos en Media por defecto)
            observation: "Reportada automáticamente por el usuario al generar su rutina en la app."
          }));

          // Las insertamos en la tabla
          const { error: alertError } = await supabase
            .from('medical_alerts')
            .insert(alertasToInsert);

          if (alertError) console.error("Error guardando alertas médicas:", alertError);
        }

        // 1. ELIMINAR FISICAMENTE las rutinas anteriores. 
        await supabase
          .from('routines')
          .delete()
          .eq('user_id', userId);

        // 2. Insertar la nueva rutina en 'routines'
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .insert({
            user_id: userId,
            name: `Plan Hipertrofia - ${nivelMap[nivel]}`,
            is_active: false // Se guarda como pendiente (false)
          })
          .select()
          .single();

        if (routineError) throw routineError;
        const routineId = routineData.id;

        // 3. Insertar Días, Bloques Musculares y Ejercicios
        for (let dIdx = 0; dIdx < resultado.length; dIdx++) {
          const day = resultado[dIdx];
          
          // Insertar Día ('routine_days')
          const { data: dayData, error: dayError } = await supabase
            .from('routine_days')
            .insert({
              routine_id: routineId,
              day_name: day.dia,
              order_index: dIdx
            })
            .select()
            .single();
            
          if (dayError) throw dayError;
          const dayId = dayData.id;

          // Insertar Bloques Musculares ('muscle_blocks')
          for (let gIdx = 0; gIdx < day.trabajo.length; gIdx++) {
            const group = day.trabajo[gIdx];

            const { data: blockData, error: blockError } = await supabase
              .from('muscle_blocks')
              .insert({
                day_id: dayId,
                muscle_name: group.grupoLabel,
                order_index: gIdx
              })
              .select()
              .single();

            if (blockError) throw blockError;
            const blockId = blockData.id;

            // Formatear array de Ejercicios
            const exercisesToInsert = group.ejercicios.map((ex) => ({
              block_id: blockId,
              name: ex.modified ? `${ex.name} (Adaptado)` : ex.name,
              sets: String(ex.sets), 
              reps: `${ex.reps} | Descanso: ${ex.rest}`, 
              video_url: null 
            }));

            if (exercisesToInsert.length > 0) {
                const { error: exercisesError } = await supabase
                  .from('exercises')
                  .insert(exercisesToInsert);
    
                if (exercisesError) throw exercisesError;
            }
          }
        }

        setSaveMessage("¡Plan generado! Pendiente de aprobación por tu entrenador.");

      } catch (error) {
        console.error("Error guardando en Supabase:", error);
        setSaveMessage("Hubo un error al guardar la rutina.");
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <div className="dashboard-container rutinas-wrapper">
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Creación de plan</p>
          <h1 className="user-name">Generar Rutina</h1>
        </div>
      </header>

      {/* 🔹 FORMULARIO (Bento Card) */}
      <section className="bento-card slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="card-title">Configuración Física</h2>
        <form className="glass-form" onSubmit={(e)=>e.preventDefault()}>
          
          <div className="form-group">
            <label>Edad (años)</label>
            <input className="glass-input" type="number" min="15" max="100" value={edad} onChange={(e)=>setEdad(e.target.value)} placeholder="Ej: 25" />
          </div>

          <div className="form-group">
            <label>Nivel de experiencia</label>
            <select className="glass-select" value={nivel} onChange={(e)=>setNivel(e.target.value)}>
              <option value="principiante">Principiante (1-6 meses)</option>
              <option value="intermedio">Intermedio (6m - 2 años)</option>
              <option value="avanzado">Avanzado (+2 años)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Días por semana</label>
            <select className="glass-select" value={dias} onChange={(e)=>setDias(Number(e.target.value))}>
              <option value={2}>2 días (Cuerpo completo)</option>
              <option value={3}>3 días (Empuje/Tirón/Pierna)</option>
              <option value={4}>4 días (Torso/Pierna x2)</option>
              <option value={5}>5 días (Weider / Frecuencia mixta)</option>
            </select>
          </div>

          <div className="form-group">
            <label>¿Tenés alguna lesión o molestia?</label>
            <select className="glass-select" value={hasLesion} onChange={(e)=>setHasLesion(e.target.value)}>
              <option value="no">No, estoy al 100%</option>
              <option value="si">Sí, necesito adaptaciones</option>
            </select>
          </div>

          {hasLesion === "si" && (
            <div className="lesiones-container slide-up">
              <label className="subtitle-label">Zonas a proteger (toca para seleccionar):</label>
              <div className="chips-grid">
                {[
                  { id: "rodilla", label: "Rodilla" },
                  { id: "espalda", label: "Espalda / Lumbar" },
                  { id: "hombro", label: "Hombro" },
                  { id: "codo", label: "Codo" },
                  { id: "tobillo", label: "Tobillo" }
                ].map((zona) => {
                  const isActive = lesiones.includes(zona.id);
                  return (
                    <button
                      key={zona.id}
                      type="button"
                      className={`chip-btn ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (isActive) {
                          setLesiones(lesiones.filter(l => l !== zona.id));
                        } else {
                          setLesiones([...lesiones, zona.id]);
                        }
                      }}
                    >
                      {zona.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <div className="error-badge">{error}</div>}

          <button type="button" className="btn-primary generate-btn" onClick={generarRutina} disabled={saving}>
            {saving ? "Generando y Guardando..." : "Construir Rutina"}
          </button>
        </form>
      </section>

      {/* 🔹 RESULTADOS DE LA RUTINA */}
      {rutina.length > 0 && (
        <div className="rutina-resultados-container">
          
          <div className="resultados-header slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="section-title">Tu Plan Personalizado</h2>
            {saving ? <span className="status-saving">Enviando a revisión...</span> : (saveMessage && <span className="status-saved">{saveMessage}</span>)}
          </div>

          {warnings.length > 0 && (
            <div className="warning-card slide-up" style={{ animationDelay: "0.25s" }}>
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Adaptaciones aplicadas:</strong>
                <ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            </div>
          )}

          <div className="rutina-dias-grid">
            {rutina.map((d, di) => (
              <section key={di} className="bento-card dia-card slide-up" style={{ animationDelay: `${0.3 + (di * 0.1)}s` }}>
                <div className="dia-header">
                  <h3>{d.dia}</h3>
                </div>
                
                <div className="dia-body">
                  {d.trabajo.map((g, gi) => (
                    <div key={gi} className="grupo-muscular">
                      <h4 className="grupo-title">{g.grupoLabel}</h4>
                      <ul className="ejercicios-list">
                        {g.ejercicios.map((ex, ei) => (
                          <li key={ei} className={ex.modified ? "ejercicio-item modified" : "ejercicio-item"}>
                            <div className="ejercicio-info">
                              <span className="ejercicio-name">{ex.name}</span>
                              <span className="ejercicio-details">{ex.sets} x {ex.reps} • {ex.rest}</span>
                            </div>
                            {ex.modified && <span className="badge-sust">SUST</span>}
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