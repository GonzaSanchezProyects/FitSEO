import React, { useState, useEffect } from "react";
import "./RutinesForm.css";
import { useNavigate } from "react-router-dom";
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

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const nivelMap = { principiante: "PRINCIPIANTE", intermedio: "INTERMEDIO", avanzado: "AVANZADO" };

  // ---------------------------
  // 1. POOLS DE EJERCICIOS (Patrones Anti-Duplicados)
  // ---------------------------
  const pools = {
    pecho_plano: [
      { name: "Press plano con mancuernas", riskyTags: ["heavy_chest_free"], pattern: "press_horiz" },
      { name: "Press en máquina sentado", riskyTags: ["machine_safe"], pattern: "press_horiz" },
      { name: "Press plano con barra", riskyTags: ["heavy_chest_free", "barbell"], pattern: "press_horiz" },
      { name: "Peck Deck (Aperturas en máquina)", riskyTags: ["machine_safe"], pattern: "fly_horiz" },
      { name: "Cruces de polea altura media", riskyTags: ["cable_safe"], pattern: "fly_horiz" },
    ],
    pecho_inclinado: [
      { name: "Press inclinado con mancuernas", riskyTags: ["heavy_chest_free"], pattern: "press_inc" },
      { name: "Press inclinado en máquina", riskyTags: ["machine_safe"], pattern: "press_inc" },
      { name: "Press inclinado con barra", riskyTags: ["heavy_chest_free", "barbell"], pattern: "press_inc" },
      { name: "Aperturas inclinadas con mancuernas", riskyTags: ["shoulder_stretch"], pattern: "fly_inc" },
      { name: "Cruces en polea baja (hacia arriba)", riskyTags: ["cable_safe"], pattern: "fly_inc" },
    ],
    pecho_declinado: [
      { name: "Fondos en paralelas", riskyTags: ["dip", "heavy_shoulder"], pattern: "dip" },
      { name: "Press declinado en máquina", riskyTags: ["machine_safe"], pattern: "press_dec" },
      { name: "Cruces en polea alta (hacia abajo)", riskyTags: ["cable_safe"], pattern: "fly_dec" },
    ],
    espalda_vertical: [
      { name: "Jalón al pecho agarre prono", riskyTags: ["machine_safe"], pattern: "pull_vert_wide" },
      { name: "Jalón al pecho agarre neutro/supino", riskyTags: ["machine_safe"], pattern: "pull_vert_close" },
      { name: "Dominadas (Libres o Asistidas)", riskyTags: ["bodyweight"], pattern: "pull_vert_wide" },
      { name: "Pull-over en polea alta", riskyTags: ["cable_safe", "shoulder_stretch"], pattern: "pullover" },
    ],
    espalda_horizontal: [
      { name: "Remo sentado en polea", riskyTags: ["machine_safe"], pattern: "row_horiz_bi" },
      { name: "Remo con mancuerna a una mano", riskyTags: ["unsupported_row"], pattern: "row_horiz_uni" },
      { name: "Remo en máquina (Apoyo al pecho)", riskyTags: ["machine_safe", "lumbar_safe"], pattern: "row_horiz_bi" },
      { name: "Remo con barra", riskyTags: ["unsupported_row", "axial_load", "lumbar_load"], pattern: "row_horiz_bi" },
    ],
    quads: [
      { name: "Sentadilla libre con barra", riskyTags: ["heavy_squat", "axial_load"], pattern: "squat_bi" },
      { name: "Sentadilla en Copa (Goblet Squat)", riskyTags: ["goblet_squat"], pattern: "squat_bi" },
      { name: "Prensa de piernas 45°", riskyTags: ["machine_safe", "heavy_knee"], pattern: "press_leg" },
      { name: "Sentadilla Hack o Multipower", riskyTags: ["machine_safe", "heavy_knee"], pattern: "squat_bi" },
      { name: "Sentadilla Búlgara", riskyTags: ["lunge", "heavy_knee"], pattern: "squat_uni" },
      { name: "Extensión de cuádriceps en máquina", riskyTags: ["machine_safe", "isolation"], pattern: "ext_leg" },
    ],
    isquios: [
      { name: "Peso muerto rumano con mancuernas", riskyTags: ["free_hinge", "lumbar_load"], pattern: "hinge" },
      { name: "Peso muerto rumano con barra", riskyTags: ["free_hinge", "axial_load", "lumbar_load"], pattern: "hinge" },
      { name: "Curl femoral tumbado", riskyTags: ["machine_safe", "isolation"], pattern: "curl_leg" },
      { name: "Curl femoral sentado", riskyTags: ["machine_safe", "isolation"], pattern: "curl_leg" },
    ],
    gluteos: [
      { name: "Hip Thrust con barra o máquina", riskyTags: ["machine_safe"], pattern: "thrust" },
      { name: "Puente de glúteos", riskyTags: ["bodyweight"], pattern: "thrust" },
      { name: "Patada de glúteo en polea", riskyTags: ["cable_safe"], pattern: "kickback" },
      { name: "Máquina abductora", riskyTags: ["machine_safe"], pattern: "abduction" },
    ],
    gemelos: [
      { name: "Elevación de talones de pie (Máquina)", riskyTags: ["heavy_calf_stand", "axial_load"], pattern: "calf_stand" },
      { name: "Elevación de talones sentado", riskyTags: ["machine_safe"], pattern: "calf_seat" },
      { name: "Elevación de talones en Prensa", riskyTags: ["machine_safe"], pattern: "calf_press" },
    ],
    hombro_press: [
      { name: "Press militar con mancuernas", riskyTags: ["overhead_press"], pattern: "press_shoulder" },
      { name: "Press de hombros en máquina", riskyTags: ["machine_safe", "overhead_press"], pattern: "press_shoulder" },
    ],
    hombro_lateral: [
      { name: "Elevaciones laterales con mancuernas", riskyTags: [], pattern: "lat_raise_free" },
      { name: "Elevaciones laterales en polea", riskyTags: ["cable_safe"], pattern: "lat_raise_cable" },
      { name: "Elevaciones frontales (Disco o Mancuernas)", riskyTags: [], pattern: "front_raise" },
    ],
    hombro_posterior: [
      { name: "Face-pull en polea alta", riskyTags: ["cable_safe"], pattern: "rear_delt_cable" },
      { name: "Pájaros en máquina (Peck Deck Inverso)", riskyTags: ["machine_safe"], pattern: "rear_delt_machine" },
      { name: "Pájaros con mancuernas (Inclinado)", riskyTags: ["unsupported_row"], pattern: "rear_delt_free" },
    ],
    biceps: [
      { name: "Curl alterno con mancuernas", riskyTags: [], pattern: "curl_bi_free" },
      { name: "Curl con barra Z", riskyTags: ["barbell"], pattern: "curl_bi_free" },
      { name: "Curl martillo con mancuernas", riskyTags: [], pattern: "curl_hammer" },
      { name: "Curl en banco Scott (Máquina)", riskyTags: ["machine_safe"], pattern: "curl_iso" },
      { name: "Curl en polea baja", riskyTags: ["cable_safe"], pattern: "curl_cable" },
    ],
    triceps: [
      { name: "Extensión de tríceps en polea alta", riskyTags: ["cable_safe"], pattern: "tri_pushdown" },
      { name: "Press Francés", riskyTags: ["heavy_triceps_ext", "elbow_stress"], pattern: "tri_skullcrusher" },
      { name: "Extensiones tras nuca (Polea/Mancuerna)", riskyTags: ["overhead_press", "shoulder_stretch"], pattern: "tri_overhead" },
      { name: "Press cerrado en banca", riskyTags: ["barbell", "heavy_chest_free"], pattern: "tri_press" },
    ],
    core: [
      { name: "Plancha abdominal (Isométrica)", riskyTags: ["bodyweight", "isometric"], pattern: "core_iso" },
      { name: "Crunch en polea alta", riskyTags: ["cable_safe"], pattern: "core_flex" },
      { name: "Elevación de piernas colgado", riskyTags: ["bodyweight"], pattern: "core_lower" },
      { name: "Press Pallof en polea", riskyTags: ["cable_safe", "lumbar_safe"], pattern: "core_anti_rot" },
    ],
  };

  const avoidTagsByInjury = {
    rodilla: ["heavy_squat", "lunge", "axial_load", "heavy_knee"],
    espalda: ["lumbar_load", "free_hinge", "axial_load", "unsupported_row"],
    hombro: ["overhead_press", "heavy_chest_free", "dip", "shoulder_stretch"],
    codo: ["heavy_triceps_ext", "heavy_chest_free", "barbell"],
    tobillo: ["heavy_calf_stand", "axial_load", "lunge"],
  };

  const safeGeneral = {
    rodilla: [
      { name: "Curl femoral sentado (Máquina)", riskyTags: ["machine_safe"], pattern: "curl_leg_safe" },
      { name: "Extensión de cuádriceps suave", riskyTags: ["machine_safe"], pattern: "ext_leg_safe" },
    ],
    espalda: [
      { name: "Remo en máquina (Apoyo al pecho)", riskyTags: ["machine_safe","lumbar_safe"], pattern: "row_horiz_bi" },
      { name: "Press Pallof (Core seguro)", riskyTags: ["lumbar_safe"], pattern: "core_anti_rot" }
    ],
    hombro: [
      { name: "Elevaciones laterales en polea (Liviano)", riskyTags: ["cable_safe"], pattern: "lat_raise_cable" },
      { name: "Face-pull en polea (Enfoque escápula)", riskyTags: ["cable_safe"], pattern: "rear_delt_cable" }
    ],
    codo: [
      { name: "Cruces en polea (Enfoque isométrico)", riskyTags: ["cable_safe"], pattern: "fly_iso" }
    ],
  };

  // ---------------------------
  // 3. ESTRUCTURAS MÉDICAS Y LÍMITES ESTRICTOS (Máximo 7 por día)
  // ---------------------------
  const getSplits = (diasRequeridos, nivelUser) => {
    // Si es principiante hace un poco menos de ejercicios (evita llegar al tope max)
    const isBeg = nivelUser === "principiante";
    const vol = (std, beg) => isBeg ? beg : std;

    const structures = {
      2: [
        { dia: "Día 1 (Full Body A)", bloques: [
          { label: "PECHO", pools: ["pecho_plano"], count: 1 },
          { label: "ESPALDA", pools: ["espalda_vertical", "espalda_horizontal"], count: vol(2, 1) },
          { label: "CUÁDRICEPS", pools: ["quads"], count: vol(2, 1) },
          { label: "ISQUIOTIBIALES", pools: ["isquios"], count: 1 }
        ]}, // Total Avanzado: 6 Ejercicios (Pierna 3)
        { dia: "Día 2 (Full Body B)", bloques: [
          { label: "HOMBROS", pools: ["hombro_press", "hombro_lateral"], count: vol(2, 1) },
          { label: "BÍCEPS", pools: ["biceps"], count: vol(2, 1) },
          { label: "TRÍCEPS", pools: ["triceps"], count: vol(2, 1) },
          { label: "GLÚTEOS", pools: ["gluteos"], count: 1 }
        ]} // Total Avanzado: 7 Ejercicios (Pierna 1)
      ],
      3: [
        { dia: "Día 1 (Empuje)", bloques: [
          { label: "PECHO", pools: ["pecho_plano", "pecho_inclinado", "pecho_declinado"], count: vol(3, 2) }, // Max Pecho 3
          { label: "HOMBRO LATERAL Y FRONTAL", pools: ["hombro_lateral"], count: vol(2, 1) },
          { label: "TRÍCEPS", pools: ["triceps"], count: vol(2, 1) }
        ]}, // Total Avanzado: 7 Ejercicios
        { dia: "Día 2 (Tirón)", bloques: [
          { label: "ESPALDA", pools: ["espalda_vertical", "espalda_horizontal"], count: vol(4, 3) }, // Max Espalda 4
          { label: "HOMBRO POSTERIOR", pools: ["hombro_posterior"], count: 1 },
          { label: "BÍCEPS", pools: ["biceps"], count: vol(2, 1) }
        ]}, // Total Avanzado: 7 Ejercicios
        { dia: "Día 3 (Piernas)", bloques: [
          { label: "CUÁDRICEPS", pools: ["quads"], count: vol(2, 2) },
          { label: "ISQUIOTIBIALES", pools: ["isquios"], count: vol(2, 1) },
          { label: "GEMELOS", pools: ["gemelos"], count: 1 }
        ]} // Total Avanzado: 5 Ejercicios (Max Pierna 5)
      ],
      4: [
        { dia: "Día 1 (Torso A)", bloques: [
          { label: "PECHO", pools: ["pecho_plano", "pecho_inclinado"], count: vol(2, 1) },
          { label: "ESPALDA", pools: ["espalda_vertical", "espalda_horizontal"], count: vol(2, 1) },
          { label: "HOMBROS", pools: ["hombro_press", "hombro_lateral"], count: 1 },
          { label: "BÍCEPS", pools: ["biceps"], count: 1 },
          { label: "TRÍCEPS", pools: ["triceps"], count: 1 }
        ]}, // Total Avanzado: 7 Ejercicios
        { dia: "Día 2 (Piernas A)", bloques: [
          { label: "CUÁDRICEPS", pools: ["quads"], count: vol(2, 2) },
          { label: "ISQUIOTIBIALES", pools: ["isquios"], count: 1 },
          { label: "GLÚTEOS", pools: ["gluteos"], count: 1 },
          { label: "GEMELOS", pools: ["gemelos"], count: 1 }
        ]}, // Total Avanzado: 5 Ejercicios
        { dia: "Día 3 (Torso B)", bloques: [
          { label: "PECHO", pools: ["pecho_inclinado", "pecho_declinado"], count: vol(2, 1) },
          { label: "ESPALDA", pools: ["espalda_horizontal", "espalda_vertical"], count: vol(2, 1) },
          { label: "HOMBROS", pools: ["hombro_lateral", "hombro_posterior"], count: 1 },
          { label: "BÍCEPS", pools: ["biceps"], count: 1 },
          { label: "TRÍCEPS", pools: ["triceps"], count: 1 }
        ]}, // Total Avanzado: 7 Ejercicios
        { dia: "Día 4 (Piernas B)", bloques: [
          { label: "ISQUIOTIBIALES", pools: ["isquios"], count: vol(2, 2) },
          { label: "CUÁDRICEPS", pools: ["quads"], count: 1 },
          { label: "GLÚTEOS", pools: ["gluteos"], count: 1 },
          { label: "GEMELOS", pools: ["gemelos"], count: 1 }
        ]} // Total Avanzado: 5 Ejercicios
      ],
      5: [
        { dia: "Día 1 (Empuje)", bloques: [
          { label: "PECHO", pools: ["pecho_plano", "pecho_inclinado", "pecho_declinado"], count: vol(4, 3) }, // Max Pecho 4
          { label: "HOMBROS", pools: ["hombro_press", "hombro_lateral"], count: vol(3, 2) } // Max Hombro 3
        ]}, // Total Avanzado: 7
        { dia: "Día 2 (Tirón)", bloques: [
          { label: "ESPALDA", pools: ["espalda_vertical", "espalda_horizontal"], count: vol(4, 3) }, // Max Espalda 4
          { label: "BÍCEPS", pools: ["biceps"], count: vol(2, 1) },
          { label: "TRÍCEPS", pools: ["triceps"], count: 1 }
        ]}, // Total Avanzado: 7
        { dia: "Día 3 (Piernas Anterior)", bloques: [
          { label: "CUÁDRICEPS", pools: ["quads"], count: vol(3, 2) },
          { label: "GLÚTEOS", pools: ["gluteos"], count: vol(2, 1) }
        ]}, // Total Avanzado: 5 (Max Pierna 5)
        { dia: "Día 4 (Torso Pesado)", bloques: [
          { label: "ESPALDA", pools: ["espalda_vertical", "espalda_horizontal"], count: vol(3, 2) },
          { label: "PECHO", pools: ["pecho_plano", "pecho_inclinado"], count: vol(3, 2) }
        ]}, // Total Avanzado: 6
        { dia: "Día 5 (Piernas Posterior y Hombros)", bloques: [
          { label: "ISQUIOTIBIALES", pools: ["isquios"], count: vol(3, 2) },
          { label: "HOMBRO LATERAL Y POST", pools: ["hombro_lateral", "hombro_posterior"], count: vol(3, 2) }
        ]} // Total Avanzado: 6
      ],
    };
    return structures[diasRequeridos];
  };

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const filterByLesions = (pool, lesionesArray = []) => {
    if (!lesionesArray.length) return pool;
    return pool.filter(ex => {
      if (Array.isArray(ex.riskyTags)) {
        const hasRisk = lesionesArray.some(lesion => {
          const riskyTagsForLesion = avoidTagsByInjury[lesion] || [];
          return riskyTagsForLesion.some(tag => ex.riskyTags.includes(tag));
        });
        if (hasRisk) return false;
      }
      return true;
    });
  };

  const generarRutina = async () => {
    setError("");
    setRutina([]);
    setWarnings([]);
    setSaveMessage("");

    const edadNum = parseInt(edad, 10);
    if (!edad || isNaN(edadNum) || edadNum < 15 || edadNum > 100) return setError("Ingresa una edad válida (15-100).");
    if (dias < 2 || dias > 5) return setError("Selecciona entre 2 y 5 días.");

    const layout = getSplits(Number(dias), nivel);
    const resultado = [];
    const warnSet = new Set();
    const lesionesValidas = hasLesion === "si" ? lesiones.filter(l => l) : [];

    const defaultSets = nivel === "principiante" ? 3 : 4;
    const defaultReps = edadNum >= 65 ? "10-15" : (nivel === "avanzado" ? "6-10" : "8-12");
    const defaultRest = edadNum >= 65 ? "90s" : (nivel === "avanzado" ? "60-90s" : "60-120s");

    layout.forEach((diaInfo) => {
      const gruposHoy = [];
      const usedPatternsThisDay = new Set(); 
      const usedNamesThisDay = new Set();    
      
      let totalExercisesToday = 0; // CANDADO DE SEGURIDAD MÁXIMO 7

      diaInfo.bloques.forEach((bloque) => {
        let rawPool = [];
        bloque.pools.forEach(p => { if (pools[p]) rawPool = [...rawPool, ...pools[p]]; });

        let safePool = filterByLesions(rawPool, lesionesValidas);
        let isAdapted = false;

        if (safePool.length < bloque.count && lesionesValidas.length > 0) {
          lesionesValidas.forEach(l => {
            if (safeGeneral[l]) safePool = [...safePool, ...safeGeneral[l]];
          });
          isAdapted = true;
          warnSet.add(`Se aplicaron reemplazos seguros en: ${bloque.label}.`);
        } else if (safePool.length < rawPool.length && lesionesValidas.length > 0) {
          isAdapted = true;
          warnSet.add(`Filtramos ejercicios lesivos en: ${bloque.label}.`);
        }

        const candidates = shuffle(safePool);
        const selectedForGroup = [];

        for (const ex of candidates) {
          if (selectedForGroup.length >= bloque.count) break;
          if (totalExercisesToday >= 7) break; // 👉 TOPE ABSOLUTO 7 EJERCICIOS
          
          if (usedNamesThisDay.has(ex.name)) continue;
          if (usedPatternsThisDay.has(ex.pattern)) continue; 

          selectedForGroup.push({
            name: ex.name,
            sets: defaultSets,
            reps: defaultReps,
            rest: defaultRest,
            modified: isAdapted
          });

          usedPatternsThisDay.add(ex.pattern);
          usedNamesThisDay.add(ex.name);
          totalExercisesToday++;
        }

        // Si faltaron ejercicios por el filtro estricto de patrones, aflojamos solo el patrón (pero NUNCA el nombre ni pasamos de 7)
        if (selectedForGroup.length < bloque.count && totalExercisesToday < 7) {
          for (const ex of candidates) {
            if (selectedForGroup.length >= bloque.count) break;
            if (totalExercisesToday >= 7) break; // 👉 TOPE ABSOLUTO 7 EJERCICIOS

            if (usedNamesThisDay.has(ex.name)) continue;

            selectedForGroup.push({
              name: ex.name,
              sets: defaultSets,
              reps: defaultReps,
              rest: defaultRest,
              modified: isAdapted
            });
            
            usedNamesThisDay.add(ex.name);
            totalExercisesToday++;
          }
        }

        if (selectedForGroup.length > 0) {
          gruposHoy.push({
            grupoLabel: bloque.label,
            ejercicios: selectedForGroup
          });
        }
      });

      resultado.push({ dia: diaInfo.dia, trabajo: gruposHoy });
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
        const userDataStr = localStorage.getItem("userData");
        const gymId = userDataStr ? JSON.parse(userDataStr).gym_id : null;

        if (!userId || !gymId) {
          setSaveMessage("Error: Tu sesión expiró o no estás logueado.");
          setSaving(false);
          return;
        }

        if (hasLesion === "si" && lesiones.length > 0) {
          await supabase.from('medical_alerts').delete().eq('user_id', userId).eq('gym_id', gymId);
          const alertasToInsert = lesiones.map(zona => ({
            user_id: userId, gym_id: gymId, 
            name: `Lesión en ${zona.charAt(0).toUpperCase() + zona.slice(1)}`,
            severity: "Media", observation: "Reportada automáticamente por el usuario."
          }));
          await supabase.from('medical_alerts').insert(alertasToInsert);
        }

        await supabase.from('routines').delete().eq('user_id', userId).eq('gym_id', gymId); 

        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .insert({ user_id: userId, gym_id: gymId, name: `Plan Estructurado - ${nivelMap[nivel]}`, is_active: false })
          .select().single();

        if (routineError) throw routineError;
        const routineId = routineData.id;

        for (let dIdx = 0; dIdx < resultado.length; dIdx++) {
          const day = resultado[dIdx];
          const { data: dayData, error: dayError } = await supabase
            .from('routine_days')
            .insert({ routine_id: routineId, day_name: day.dia, order_index: dIdx })
            .select().single();
            
          if (dayError) throw dayError;

          for (let gIdx = 0; gIdx < day.trabajo.length; gIdx++) {
            const group = day.trabajo[gIdx];
            const { data: blockData, error: blockError } = await supabase
              .from('muscle_blocks')
              .insert({ day_id: dayData.id, muscle_name: group.grupoLabel, order_index: gIdx })
              .select().single();

            if (blockError) throw blockError;

            const exercisesToInsert = group.ejercicios.map((ex) => ({
              block_id: blockData.id,
              name: ex.modified ? `${ex.name} (Adaptado)` : ex.name,
              sets: String(ex.sets), 
              reps: String(ex.reps),       // 👉 Limpio, solo "8-12"
              rest_time: String(ex.rest),  // 👉 Guardado en su propia columna
              video_url: null 
            }));

            if (exercisesToInsert.length > 0) {
                await supabase.from('exercises').insert(exercisesToInsert);
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
              <option value={2}>2 Días (Cuerpo Completo)</option>
              <option value={3}>3 Días (Push / Pull / Legs)</option>
              <option value={4}>4 Días (Torso / Pierna)</option>
              <option value={5}>5 Días (PPL + Antagonistas)</option>
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
                        if (isActive) setLesiones(lesiones.filter(l => l !== zona.id));
                        else setLesiones([...lesiones, zona.id]);
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
            {saving ? "Generando y Guardando..." : "Construir Rutina Equilibrada"}
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
                <strong>Modificaciones clínicas aplicadas:</strong>
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
                            {ex.modified && <span className="badge-sust" title="Ejercicio adaptado para proteger tu lesión">Seguro</span>}
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