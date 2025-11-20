// RoutinesForm_fixed.jsx
// Versión legible: nombres y textos simplificados para usuarios con poca experiencia.
import React, { useState, useEffect } from "react";
import "./RutinesForm.css";
import { useNavigate } from "react-router-dom";

export default function RoutinesForm() {
  const navigate = useNavigate();

  // ---------------------------
  // CONFIG - ajustar según servidor
  // ---------------------------
  // ACTUALIZADO: Nueva URL de Azure
  const API_BASE_URL = "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net"; 

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.isAuthenticated) {
        navigate("/login");
      }
    } catch (e) {
      // si localStorage está mal, redirigimos también
      navigate("/login");
    }
  }, [navigate]);

  // ---------------------------
  // Estados básicos del formulario (idénticos con adiciones para guardado)
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
  // Nuevos estados para integración con DB
  // ---------------------------
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [clientStateId, setClientStateId] = useState(null);
  const [clientId, setClientId] = useState("1"); // PRUEBAS: clientId fijo

  // Mapeos para la API
  const nivelMap = { principiante: "PRINCIPIANTE", intermedio: "INTERMEDIO", avanzado: "AVANZADO" };
  const lesionLabelMap = { rodilla: 'Rodilla', espalda: 'Espalda / lumbar', hombro: 'Hombro', codo: 'Codo', tobillo: 'Tobillo' };

  // ---------------------------
  // Intento de cargar clientId y último client-state existente al montar
  // ---------------------------
  useEffect(() => {
    // PRUEBAS: forzamos clientId = "1"
    setClientId("1");

    (async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const idFromStorage = userData?.id || userData?.clientId || "1";
        const idToUse = idFromStorage || "1";
        const token = localStorage.getItem("crmToken") || userData?.token || null;

        // Usamos la ruta correcta para listar estados por cliente: /api/client-state/client/{clientId}
        const url = `${API_BASE_URL}/api/client-state/client/${encodeURIComponent(idToUse)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          // Puede venir como lista (histórico) o como objeto único; manejamos ambos casos
          if (Array.isArray(data) && data.length > 0) {
            const last = data[data.length - 1];
            if (last?.id) setClientStateId(last.id);
          } else if (data && data.id) {
            setClientStateId(data.id);
          }
        } else {
          const txt = await res.text().catch(() => "");
          console.warn(`No se pudo leer client-state (GET): ${res.status} ${txt}`);
        }
      } catch (e) {
        console.warn("Error leyendo historial de client-state:", e);
      }
    })();
  }, []);

  // ---------------------------
  // Pools, utilidades y lógica de generación (sin cambios semánticos)
  // ---------------------------
  const pools = {
    pecho_sup: [
      { name: "Press inclinado con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Aperturas inclinadas con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Press inclinado en máquina (con apoyo)", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    pecho_mid: [
      { name: "Press plano con mancuernas", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
      { name: "Press en máquina sentado (apoyo)", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Press plano con barra (si lo tolera)", joints: ["pecho","hombro"], riskyTags: ["barbell","axial_load"], equipment: "barra" },
    ],
    pecho_inf: [
      { name: "Press declinado en máquina", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Fondos asistidos para pecho", joints: ["pecho","hombro","codo"], riskyTags: ["bodyweight"], equipment: "bodyweight" },
    ],
    espalda_altas: [
      { name: "Jalón en polea con apoyo", joints: ["espalda","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Remo sentado en máquina (apoyo)", joints: ["espalda","codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Remo con mancuerna apoyado", joints: ["espalda","codo"], riskyTags: [], equipment: "manc" },
    ],
    espalda_baja: [
      { name: "Remo con mancuerna apoyado", joints: ["espalda","codo"], riskyTags: [], equipment: "manc" },
      { name: "Extensiones suaves de espalda (solo con autorización)", joints: ["espalda"], riskyTags: ["extension","lumbar_load"], equipment: "bench" },
      { name: "Levantamiento controlado para isquiotibiales (con cuidado lumbar)", joints: ["espalda","cadera"], riskyTags: ["lumbar_load","hip_hinge"], equipment: "barra" },
    ],
    quads: [
      { name: "Prensa de piernas (movimiento corto)", joints: ["rodilla","cadera"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Sentadilla con asistencia (silla/box)", joints: ["rodilla","cadera"], riskyTags: ["barbell","axial_load"], equipment: "barra" },
      { name: "Extensión de pierna en máquina (conservador)", joints: ["rodilla"], riskyTags: ["isolation"], equipment: "maquina" },
    ],
    femorales_gluteos: [
      { name: "Puente de glúteos en banco (controlado)", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "manc" },
      { name: "Curl de piernas en máquina", joints: ["rodilla"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Subidas a banco asistidas (step-up)", joints: ["rodilla","cadera"], riskyTags: [], equipment: "bodyweight" },
      { name: "Levantamiento para isquiotibiales (evitar si duele la espalda)", joints: ["espalda","cadera"], riskyTags: ["lumbar_load","hip_hinge"], equipment: "barra" },
    ],
    gemelos: [
      { name: "Elevación de talones sentado", joints: ["tobillo"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Elevación de talones de pie con soporte", joints: ["tobillo"], riskyTags: [], equipment: "bodyweight" },
    ],
    deltoides: [
      { name: "Press con mancuernas sentado (agarre cómodo)", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Elevaciones laterales con poco peso", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Tirón para la parte alta de la espalda (face-pull)", joints: ["hombro","escapula"], riskyTags: [], equipment: "cable" },
      { name: "Press por detrás de la cabeza (evitar)", joints: ["hombro"], riskyTags: ["avoid","overhead_heavy"], equipment: "barra" },
    ],
    biceps: [
      { name: "Curl con mancuerna (apoyo)", joints: ["codo"], riskyTags: [], equipment: "manc" },
      { name: "Curl tipo martillo", joints: ["codo","antebrazo"], riskyTags: [], equipment: "manc" },
      { name: "Curl en máquina (apoyo)", joints: ["codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    triceps: [
      { name: "Extensión de tríceps en polea (cuerda)", joints: ["codo"], riskyTags: ["machine_safe"], equipment: "cable" },
      { name: "Press cerrado con barra (si lo tolera)", joints: ["codo","hombro"], riskyTags: ["barbell"], equipment: "barra" },
      { name: "Fondos asistidos", joints: ["codo","hombro"], riskyTags: ["bodyweight"], equipment: "bodyweight" },
    ],
    core: [
      { name: "Plancha apoyando rodillas", joints: ["core"], riskyTags: ["isometric"], equipment: "bodyweight" },
      { name: "Control abdominal tumbado (levantar piernas lentamente)", joints: ["core"], riskyTags: ["motor_control"], equipment: "bodyweight" },
      { name: "Extensión alternada en cuatro apoyos (control)", joints: ["core","espalda"], riskyTags: ["motor_control"], equipment: "bodyweight" },
    ],
  };

  const safeByGroup = {
    espalda_baja: [
      { name: "Remo en máquina con respaldo", joints: ["espalda","codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Puente de glúteos controlado", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "manc" },
    ],
    pecho_sup: [
      { name: "Press inclinado en máquina (con apoyo)", joints: ["pecho","hombro"], riskyTags: ["machine_safe"], equipment: "maquina" },
      { name: "Press inclinado con mancuernas (movimiento controlado)", joints: ["pecho","hombro"], riskyTags: [], equipment: "manc" },
    ],
    deltoides: [
      { name: "Press con mancuernas (agarre cómodo)", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Elevaciones laterales suaves", joints: ["hombro"], riskyTags: [], equipment: "manc" },
    ],
    quads: [
      { name: "Prensa de piernas (movimiento corto)", joints: ["rodilla","cadera"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    femorales_gluteos: [
      { name: "Puente de glúteos (controlado)", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "manc" },
    ],
  };

  const safeGeneral = {
    rodilla: [
      { name: "Bicicleta estática (bajo impacto)", joints: [], riskyTags: ["cardio_lowimpact"], equipment: "bike" },
      { name: "Puente de glúteos desde el suelo", joints: ["cadera","gluteo"], riskyTags: ["hip_thrust_safe"], equipment: "bodyweight" },
    ],
    espalda: [
      { name: "Control abdominal tumbado", joints: ["core"], riskyTags: ["motor_control"], equipment: "bodyweight" },
      { name: "Remo en máquina con respaldo", joints: ["espalda","codo"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
    hombro: [
      { name: "Press con mancuernas (agarre cómodo)", joints: ["hombro"], riskyTags: [], equipment: "manc" },
      { name: "Elevaciones laterales suaves", joints: ["hombro"], riskyTags: [], equipment: "manc" },
    ],
    codo: [
      { name: "Curl con banda (tensión baja)", joints: ["codo"], riskyTags: ["band"], equipment: "band" },
    ],
    tobillo: [
      { name: "Bicicleta estática", joints: [], riskyTags: ["cardio_lowimpact"], equipment: "bike" },
      { name: "Elevación gemelos sentado", joints: ["tobillo"], riskyTags: ["machine_safe"], equipment: "maquina" },
    ],
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

  const capsPerFamilyDefault = {
    pecho: 3, espalda: 3, quads: 3, femorales_gluteos: 3, deltoides: 3, biceps: 2, triceps: 2, gemelos: 2, core: 2,
  };

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
    const repsRange = edadNum >= 75 ? "8-15 (foco en técnica)" : (nivel === "avanzado" ? "6-10" : "8-12");
    const rest = edadNum >= 75 ? "60-120s" : (nivel === "avanzado" ? "60-90s" : "60-120s");
    return { ejerciciosPorSesion, setsPerExercise, repsRange, rest, setsPerSession };
  };

  const groupKeywords = {
    pecho_sup: ["press","apertura","inclinado","banca"],
    pecho_mid: ["press","banca","apertura"],
    pecho_inf: ["press","declinado","fondos"],
    espalda_altas: ["remo","jalon","pull","row"],
    espalda_baja: ["remo","levantamiento","peso muerto","extensión","espalda"],
    quads: ["sentadilla","prensa","extensión","pierna"],
    femorales_gluteos: ["puente","hip","zancada","step","curl femoral"],
    gemelos: ["talon","gemelo","elevación"],
    deltoides: ["press","elevacion","lateral","hombro"],
    biceps: ["curl","martillo"],
    triceps: ["extensión","press cerrado","fondos"],
    core: ["plancha","abdominal","control","core"],
  };

  const toLower = (s = "") => s.toLowerCase();
  const isFunctionalRelevant = (ex, groupKey) => {
    const mainJointsByGroup = {
      pecho_sup: ["pecho","hombro"],
      pecho_mid: ["pecho","hombro"],
      pecho_inf: ["pecho","hombro"],
      espalda_altas: ["espalda","hombro"],
      espalda_baja: ["espalda","cadera"],
      quads: ["rodilla","cadera"],
      femorales_gluteos: ["cadera","rodilla","gluteo"],
      gemelos: ["tobillo"],
      deltoides: ["hombro"],
      biceps: ["codo"],
      triceps: ["codo"],
      core: ["core","espalda"],
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

  // ---------------------------
  // Guardado - helper robusto para POST/PUT
  // ---------------------------
  const sendClientState = async (method, url, payload, token) => {
    // Devuelve el objeto { ok, status, bodyText, json }
    try {
      console.log("[client-state] enviando", method, url, payload);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
      return { ok: res.ok, status: res.status, text, json };
    } catch (e) {
      console.error("Error en request client-state:", e);
      return { ok: false, status: 0, text: String(e), json: null };
    }
  };

  // ---------------------------
  // Generador (misma lógica, marcas sustituciones con modified)
  // ---------------------------
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
    if (!splits[dias]) {
      setError("Selecciona entre 2 y 5 días.");
      return;
    }

    const capsPerFamily = { ...capsPerFamilyDefault };
    if (edadNum >= 80) Object.keys(capsPerFamily).forEach(k => capsPerFamily[k] = Math.max(1, Math.floor(capsPerFamily[k] * 0.5)));
    else if (edadNum >= 70) Object.keys(capsPerFamily).forEach(k => capsPerFamily[k] = Math.max(1, Math.floor(capsPerFamily[k] * 0.75)));

    const template = splits[dias];
    const sessionsCount = countSessions(template);
    const dayNamesMap = { 2:["Lunes","Jueves"], 3:["Lunes","Miércoles","Viernes"], 4:["Lunes","Martes","Jueves","Viernes"], 5:["Lunes","Martes","Miércoles","Jueves","Viernes"] };
    const dayNames = dayNamesMap[dias];

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
          if (poolHadRisk) warnSet.add(`Se adaptó el grupo "${gKey.replace(/_/g," ")}" por lesión/es (${lesionesValidas.join(", ")}).`);
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

        if (selected.length < take) {
          const fallbacks = [];
          if (safeByGroup[gKey] && safeByGroup[gKey].length) safeByGroup[gKey].forEach(s => fallbacks.push(s));
          lesionesValidas.forEach(l => { (safeGeneral[l] || []).forEach(s => fallbacks.push(s)); });
          const fallbackUniq = [];
          fallbacks.forEach(f => { if (!fallbackUniq.some(u => u.name === f.name)) fallbackUniq.push(f); });

          let fi = 0;
          while (selected.length < take && fi < fallbackUniq.length) {
            const ex = fallbackUniq[fi++];
            if (!ex || !ex.name) continue;
            if (usedThisDay.has(ex.name)) continue;
            if ((usedExerciseCountWeek[ex.name] || 0) >= maxPerWeek) continue;
            if (!isFunctionalRelevant(ex, gKey)) continue;
            selected.push({ name: ex.name, sets: Math.max(1, plan.setsPerExercise - 1), reps: plan.repsRange, rest: plan.rest, note: "sustituto por lesión", modified: true });
            usedThisDay.add(ex.name);
            usedExerciseCountWeek[ex.name] = (usedExerciseCountWeek[ex.name] || 0) + 1;
            warnSet.add(`Sustitución en ${gKey.replace(/_/g," ")} → ${ex.name} (por lesión/es: ${lesionesValidas.join(", ")})`);
          }
        }

        if (selected.length === 0) {
          const fallback = pool[0];
          selected.push({ name: fallback.name, sets: Math.max(1, plan.setsPerExercise - 1), reps: plan.repsRange, rest: plan.rest, note: "fallback (revisar)", modified: true });
          usedExerciseCountWeek[fallback.name] = (usedExerciseCountWeek[fallback.name] || 0) + 1;
          warnSet.add(`Fallback forzado: se usó ${fallback.name} en ${gKey.replace(/_/g," ")} — revisar alternativa.`);
        }

        familyCountToday[family] = (familyCountToday[family] || 0) + selected.length;

        gruposHoy.push({
          grupoKey: gKey,
          grupoLabel: gKey.replace(/_/g, " "),
          ejercicios: selected,
          note: `Sets por semana aprox: ${plan.setsPerSession}`,
        });
      });

      resultado.push({ dia: dayName, trabajo: gruposHoy });
    });

    setWarnings(Array.from(warnSet));
    setRutina(resultado);

    // ---------------------------
    // Guardado automático de "preguntas" en la API (client-state)
    // ---------------------------
    (async () => {
      setSaving(true);
      setSaveMessage("");
      try {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const id = clientId || userData?.id || userData?.clientId || null;
        if (!id) {
          setSaveMessage("No se guardó: clientId no encontrado en localStorage (userData.id). Puedes configurar clientId en userData o guardarlo manualmente.");
          setSaving(false);
          return;
        }

        // token preferido: crmToken en localStorage, fallback a userData.token
        const token = localStorage.getItem("crmToken") || userData?.token || null;

        const idNumber = Number(id);
        if (!Number.isInteger(idNumber) || idNumber <= 0) {
          setSaveMessage("clientId inválido para guardar (debe ser un entero positivo).");
          setSaving(false);
          return;
        }

        const phys = (lesionesValidas || []).length > 0 ? (lesionesValidas.map(l => lesionLabelMap[l] || l)) : ["Ninguna"];

        const payload = {
          clientId: idNumber,
          age: edadNum,
          level: nivelMap[nivel] || "PRINCIPIANTE",
          daysPerWeek: Number(dias),
          physicalConditions: phys,
        };

        // DEBUG
        console.log("Payload final client-state:", payload);

        let resObj;
        if (clientStateId) {
          // Intentar actualizar (PUT)
          const urlPut = `${API_BASE_URL}/api/client-state/${encodeURIComponent(clientStateId)}`;
          resObj = await sendClientState('PUT', urlPut, payload, token);

          if (resObj.ok) {
            const data = resObj.json || null;
            if (data && data.id) setClientStateId(data.id);
            localStorage.setItem('lastClientStateId', data?.id || clientStateId);
            setSaveMessage('Preguntas guardadas (client-state actualizado).');
          } else if (resObj.status === 404) {
            // Si no existe, intentar crear
            const urlPost = `${API_BASE_URL}/api/client-state`;
            const createRes = await sendClientState('POST', urlPost, payload, token);
            if (createRes.ok) {
              const created = createRes.json || null;
              setClientStateId(created?.id || null);
              localStorage.setItem('lastClientStateId', created?.id || '');
              setSaveMessage('Preguntas guardadas (client-state creado).');
            } else {
              setSaveMessage(`No se pudo crear client-state: ${createRes.status} ${createRes.text || ''}`);
            }
          } else {
            setSaveMessage(`No se pudo actualizar client-state: ${resObj.status} ${resObj.text || ''}`);
          }
        } else {
          // Crear nuevo (POST)
          const urlPost = `${API_BASE_URL}/api/client-state`;
          const createRes = await sendClientState('POST', urlPost, payload, token);
          if (createRes.ok) {
            const created = createRes.json || null;
            setClientStateId(created?.id || null);
            localStorage.setItem('lastClientStateId', created?.id || '');
            setSaveMessage('Preguntas guardadas (client-state creado).');
          } else {
            setSaveMessage(`No se pudo crear client-state: ${createRes.status} ${createRes.text || ''}`);
          }
        }
      } catch (e) {
        setSaveMessage('Error al guardar en la base de datos (ver consola).');
        console.error("Error guardando client-state:", e);
      } finally {
        setSaving(false);
      }
    })();
  };

  // UI helper lesiones
  const agregarLesion = () => setLesiones(prev => [...prev, ""]);
  const actualizarLesion = (i, val) => setLesiones(prev => prev.map((v, idx) => idx === i ? val : v));
  const eliminarLesion = (i) => setLesiones(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="formContainer">
      <form className="form-rutina" onSubmit={(e)=>e.preventDefault()}>
        <h2>Generador de Rutinas — Hipertrofia (Gimnasio)</h2>

        <div className="campo">
          <label>Edad (años):</label>
          <input type="number" min="15" max="100" value={edad} onChange={(e)=>setEdad(e.target.value)} placeholder="Ej: 80" />
        </div>

        <div className="campo">
          <label>Experiencia en el gimnasio:</label>
          <select value={nivel} onChange={(e)=>setNivel(e.target.value)}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        <div className="campo">
          <label>Días por semana:</label>
          <select value={dias} onChange={(e)=>setDias(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div className="campo">
          <label>¿Tenés alguna lesión?</label>
          <select value={hasLesion} onChange={(e)=>setHasLesion(e.target.value)}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>

        {hasLesion === "si" && (
          <div className="campo">
            <label>Lesiones actuales (podés agregar varias):</label>
            {lesiones.map((l, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <select value={l} onChange={(e)=>actualizarLesion(idx, e.target.value)}>
                  <option value="">Seleccionar articulación</option>
                  <option value="rodilla">Rodilla</option>
                  <option value="espalda">Espalda / lumbar</option>
                  <option value="hombro">Hombro</option>
                  <option value="codo">Codo</option>
                  <option value="tobillo">Tobillo</option>
                </select>
                <button type="button" onClick={()=>eliminarLesion(idx)} title="Eliminar lesión">❌</button>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>
              <button type="button" onClick={agregarLesion}>+ Agregar otra lesión</button>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Si indicás varias, el generador eliminará o sustituirá ejercicios que choquen con cualquiera de ellas.
              </div>
            </div>
          </div>
        )}

        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

        <div className="botones">
          <button type="button" onClick={generarRutina}>Generar rutina</button>
        </div>
      </form>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="form-rutina" style={{ marginTop: 12 }}>
          <h4>Advertencias / sustituciones:</h4>
          <ul>
            {warnings.map((w, i) => <li key={i} style={{ color: "#a54" }}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Rutina */}
      {rutina.length > 0 && (
        <div className="form-rutina" style={{ marginTop: 12 }}>
          <h3>Tu rutina personalizada (Hipertrofia — adaptada)</h3>
          {rutina.map((d, di) => (
            <div key={di} style={{ marginBottom: 16 }}>
              <strong>{d.dia}</strong>
              {d.trabajo.map((g, gi) => (
                <div key={gi} style={{ marginLeft: 12, marginTop: 8 }}>
                  <em style={{ textTransform: "capitalize" }}>{g.grupoLabel}:</em>
                  <div style={{ marginLeft: 10 }}>
                    {g.ejercicios.map((ex, ei) => (
                      <div key={ei} className={ex.modified ? "modified-ex-row" : ""} style={{ marginBottom: 6 }}>
                        <span className={ex.modified ? "modified-ex" : ""}>
                          • {ex.name} — {ex.sets} x {ex.reps} {ex.note ? `(${ex.note})` : ""} — descanso: {ex.rest}
                        </span>
                        {ex.modified && <span className="modified-badge">SUST.</span>}
                      </div>
                    ))}
                    <small style={{ color: "#555" }}>{g.note}</small>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
            <strong>Notas importantes:</strong>
            <ul>
              <li>Las sustituciones aparecen con la etiqueta <span className="modified-badge">SUST.</span> y texto destacado.</li>
              <li>Si hay dolor real o signos preocupantes (hormigueo, debilidad) → cortar y consultar a un profesional.</li>
            </ul>

            {/* Estado de guardado */}
            <div style={{ marginTop: 8 }}>
              {saving ? <div>Guardando preguntas en la base de datos...</div> : (saveMessage ? <div style={{ color: saveMessage.toLowerCase().includes('error') ? 'crimson' : '#2a7' }}>{saveMessage}</div> : null)}
            </div>

          </div>
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