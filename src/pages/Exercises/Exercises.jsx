import "./Exercises.css";
import { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import YouTubeIcon from "@mui/icons-material/YouTube"; 
import AutoStoriesIcon from "@mui/icons-material/AutoStories"; 
import RestartAltIcon from "@mui/icons-material/RestartAlt"; // Icono para reinicio manual (opcional)
import { useNavigate } from "react-router-dom";

/* ---------- CONFIG ---------- */
const API_BASE_URL = "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net";

/* ---------- DICCIONARIO DE VIDEOS ---------- */
const videoIds = {
  "Press inclinado mancuernas": "PqQ4AhX_WDI",
  "Aperturas inclinadas": "8WqHqA5tTQU",
  "Press plano mancuernas": "oej7DDV5EMU",
  "Press plano máquina": "xUm0BdZQxK4",
  "Fondos asistidos": "yZ8kP0JjQBs",
  "Press declinado": "LfyQBUKR8SE",
  "Jalón al pecho": "mxX-bxJMVmA",
  "Remo en máquina": "ue8MXKXdOVw",
  "Remo mancuerna": "PCCzL2oNCDM",
  "Extensiones espalda": "ph3pddpKzzw",
  "Prensa piernas": "hl-EJUQ2yuc",
  "Sentadilla Globet": "oQRokYl3Vcg",
  "Puente glúteos": "cJkMcYBTvB4",
  "Curl femoral": "Zrwhg0sGzGg",
  "Elevación talones sentado": "JbyjNymZOt0",
  "Elevación talones pie": "-M4-G8pCKyQ",
  "Press hombros": "B-aVuyhvLHU",
  "Elevaciones laterales": "8I4y-GJp1lI",
  "Curl bíceps": "UDblkPDopgQ",
  "Curl martillo": "zC3nLlEvin4",
  "Extensión polea": "f6y9aKTLH8M", 
  "Fondos": "2z8JmcrW-As", 
  "Plancha": "3AM7L2k7BEw",
  "Crunch": "MKmrqcoCZ-M"
};

/* ---------- INFO TEXTUAL ---------- */
const exerciseLibrary = {
  default: { desc: "Ejecuta con Rango de Movimiento Completo (ROM).", tips: ["Controla la fase excéntrica.", "Evita la inercia."] },
  press: { desc: "Empuje horizontal/vertical. Estabilidad escapular clave.", tips: ["Retrae escápulas al bajar.", "Codos a 45º (no 90º).", "Pies firmes en el suelo."] },
  jalon: { desc: "Tracción vertical para dorsal ancho.", tips: ["Inicia bajando los hombros.", "Lleva la barra al pecho alto.", "Torso ligeramente inclinado."] },
  remo: { desc: "Tracción horizontal para densidad.", tips: ["Saca pecho (extensión torácica).", "Codos rozando el cuerpo.", "Pausa 1s atrás."] },
  sentadilla: { desc: "Patrón de rodilla dominante.", tips: ["Rompe el paralelo (profundidad).", "Rodillas alineadas con puntas.", "Core tenso."] },
  prensa: { desc: "Empuje de piernas compuesto.", tips: ["No bloquees rodillas al extender.", "Lumbar pegado al respaldo.", "Baja profundo."] },
  extensi: { desc: "Aislamiento de cuádriceps.", tips: ["Pausa de 1s arriba.", "Baja en 3 segundos.", "Alinea rodilla con eje máquina."] },
  curl: { desc: "Flexión de codo.", tips: ["Hombros fijos abajo.", "Sin balanceo lumbar.", "Codos pegados al costado."] },
  elevaci: { desc: "Abducción de hombro.", tips: ["Codos levemente flexionados.", "Sube hasta altura de hombros.", "Baja resistiendo."] },
  plancha: { desc: "Isometría de core (anti-extensión).", tips: ["Glúteo y abdomen de acero.", "Cuerpo en línea recta.", "No hundas la cadera."] },
  puente: { desc: "Extensión de cadera (Glúteo).", tips: ["Empuje desde talones.", "Contracción máxima arriba.", "Barbilla al pecho."] }
};

const getExerciseInfo = (name) => {
  const n = (name || "").toLowerCase();
  let info = exerciseLibrary.default;
  if (n.includes("sentadilla")) info = exerciseLibrary.sentadilla;
  else if (n.includes("prensa")) info = exerciseLibrary.prensa;
  else if (n.includes("jalon") || n.includes("jalón")) info = exerciseLibrary.jalon;
  else if (n.includes("remo") || n.includes("row")) info = exerciseLibrary.remo;
  else if (n.includes("press")) info = exerciseLibrary.press;
  else if (n.includes("extensi") || n.includes("fondos")) info = exerciseLibrary.extensi;
  else if (n.includes("curl")) info = exerciseLibrary.curl;
  else if (n.includes("elevaci") || n.includes("vuelos")) info = exerciseLibrary.elevaci;
  else if (n.includes("plancha") || n.includes("abdominal")) info = exerciseLibrary.plancha;
  else if (n.includes("puente") || n.includes("hip")) info = exerciseLibrary.puente;
  return info; 
};

const sanitizeId = (s) => String(s || "").replace(/\s+/g, "_").replace(/[^\w\-]/g, "").slice(0, 80);
const shuffle = (arr) => {
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- POOLS ---------- */
const pools = {
  pecho_sup: [{name:"Press inclinado mancuernas"}, {name:"Aperturas inclinadas"}],
  pecho_mid: [{name:"Press plano mancuernas"}, {name:"Press plano máquina"}],
  pecho_inf: [{name:"Fondos asistidos"}, {name:"Press declinado"}],
  espalda_altas: [{name:"Jalón al pecho"}, {name:"Remo en máquina"}],
  espalda_baja: [{name:"Remo mancuerna"}, {name:"Extensiones espalda"}],
  quads: [{name:"Prensa piernas"}, {name:"Sentadilla Globet"}],
  femorales_gluteos: [{name:"Puente glúteos"}, {name:"Curl femoral"}],
  gemelos: [{name:"Elevación talones sentado"}, {name:"Elevación talones pie"}],
  deltoides: [{name:"Press hombros"}, {name:"Elevaciones laterales"}],
  biceps: [{name:"Curl bíceps"}, {name:"Curl martillo"}],
  triceps: [{name:"Extensión polea"}, {name:"Fondos"}],
  core: [{name:"Plancha"}, {name:"Crunch"}],
};

const splits = {
  2: [["pecho_mid", "espalda_altas", "quads", "femorales_gluteos", "deltoides", "biceps", "triceps", "core"], ["pecho_sup", "pecho_inf", "espalda_baja", "gemelos", "deltoides", "biceps", "triceps", "core"]],
  3: [["pecho_sup", "pecho_mid", "deltoides", "triceps"], ["espalda_altas", "espalda_baja", "biceps", "core"], ["quads", "femorales_gluteos", "gemelos"]],
  4: [["pecho_mid", "espalda_altas", "deltoides", "biceps"], ["quads", "femorales_gluteos", "core", "gemelos"], ["pecho_sup", "espalda_baja", "deltoides", "triceps"], ["quads", "femorales_gluteos", "core", "gemelos"]],
  5: [["pecho_sup", "pecho_mid", "deltoides"], ["espalda_altas", "espalda_baja", "biceps"], ["quads", "femorales_gluteos", "gemelos"], ["pecho_mid", "espalda_altas", "deltoides"], ["biceps", "triceps", "core"]],
};

const weeklySetsBase = { principiante: 8, intermedio: 11, avanzado: 15 };
const countSessions = (template) => { const c = {}; template.forEach(d => d.forEach(g => c[g] = (c[g]||0)+1)); return c; };
const planForMuscle = (mKey, sPerWeek, level, age) => {
  let wTarget = weeklySetsBase[level] || 10;
  if (age>=65) wTarget = Math.round(wTarget*0.8);
  const setsPerSession = Math.max(1, Math.round(wTarget/Math.max(1,sPerWeek)));
  const setsPerEx = (level==="principiante"||age>=70) ? 2 : 3;
  const exPerSession = Math.max(1, Math.ceil(setsPerSession/setsPerEx));
  return { ejerciciosPorSesion: exPerSession, setsPerExercise: setsPerEx, repsRange: "8-12", rest: "60-90s", setsPerSession };
};

const generateRoutineFromParams = ({ age = 30, level = "principiante", daysPerWeek = 3 }) => {
  const template = splits[daysPerWeek] || splits[3];
  const result = {};
  const daysMap = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
  const usedEx = new Set();

  template.forEach((dayGroups, idx) => {
    const dayName = daysMap[idx] || `Día ${idx+1}`;
    const groupsObj = {};
    dayGroups.forEach(gKey => {
      const pool = pools[gKey];
      if(!pool) return;
      const plan = planForMuscle(gKey, countSessions(template)[gKey], level, age);
      let candidates = shuffle(pool).filter(e => !usedEx.has(e.name));
      if(candidates.length < plan.ejerciciosPorSesion) candidates = shuffle(pool);
      const selected = candidates.slice(0, plan.ejerciciosPorSesion).map(ex => {
        usedEx.add(ex.name);
        return { ...ex, sets: plan.setsPerExercise, reps: plan.repsRange, rest: plan.rest };
      });
      groupsObj[gKey.replace("_", " ")] = selected;
    });
    result[dayName] = groupsObj;
  });
  return result;
};

/* ---------- COMPONENT ---------- */
const Exercises = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(localStorage.getItem("selectedDay") || "Lunes");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("completedExercises_v4") || "{}"); } 
    catch { return {}; }
  });

  // --- NUEVA LÓGICA DE REINICIO SEMANAL ---
  const checkWeeklyReset = () => {
    const startDateStr = localStorage.getItem("weekStartDate");
    const now = new Date();

    if (!startDateStr) {
      // Primera vez: Guardamos fecha de hoy como inicio
      localStorage.setItem("weekStartDate", now.toISOString());
    } else {
      const startDate = new Date(startDateStr);
      const diffTime = Math.abs(now - startDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convertir ms a días

      // Si pasaron 7 días o más...
      if (diffDays >= 7) {
        // 1. Reiniciamos el estado local
        setCompleted({});
        // 2. Reiniciamos el almacenamiento
        localStorage.setItem("completedExercises_v4", JSON.stringify({}));
        // 3. Actualizamos la fecha de inicio a "hoy"
        localStorage.setItem("weekStartDate", now.toISOString());
        console.log("Semana completada. Ejercicios reiniciados automáticamente.");
      }
    }
  };

  // Función para forzar reinicio manual (Botón Extra)
  const handleManualReset = () => {
    if(window.confirm("¿Quieres reiniciar toda la semana y desmarcar todo?")) {
        setCompleted({});
        localStorage.setItem("completedExercises_v4", JSON.stringify({}));
        localStorage.setItem("weekStartDate", new Date().toISOString());
    }
  };

  useEffect(() => { 
    mountedRef.current = true; 
    AOS.init({duration:500}); 
    
    // Verificamos el reinicio apenas carga el componente
    checkWeeklyReset();

    return () => { mountedRef.current = false; }; 
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingPlan(true);
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (!userData?.isAuthenticated) { navigate("/login"); return; }
        const lastClientStateId = localStorage.getItem("lastClientStateId");
        let generated = null;
        if (lastClientStateId) {
            const token = localStorage.getItem("crmToken");
            const res = await fetch(`${API_BASE_URL}/api/client-state/${lastClientStateId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const json = await res.json();
                generated = generateRoutineFromParams({ age: json.age, level: json.level.toLowerCase(), daysPerWeek: json.daysPerWeek });
            }
        }
        if (!generated) generated = generateRoutineFromParams({ age: 30, level: "principiante", daysPerWeek: 3 });
        if (mountedRef.current) {
            setPlan(generated);
            if (!generated[selectedDay]) setSelectedDay(Object.keys(generated)[0]);
            setLoadingPlan(false);
        }
      } catch (e) { setError("Error cargando rutina."); setLoadingPlan(false); }
    })();
  }, [navigate]);

  const toggleCompleted = (day, exId) => {
    setCompleted(prev => {
      const newState = { ...prev };
      const dayState = { ...(newState[day] || {}) };
      dayState[exId] = !dayState[exId];
      newState[day] = dayState;
      localStorage.setItem("completedExercises_v4", JSON.stringify(newState)); 
      return newState;
    });
  };

  const getEresFitnessUrl = (exerciseName) => {
    return `https://eresfitness.com/?s=${encodeURIComponent(exerciseName)}`;
  };

  const getYoutubeUrl = (name) => {
    const id = videoIds[name];
    return id 
      ? `https://www.youtube.com/watch?v=${id}` 
      : `https://www.youtube.com/results?search_query=${encodeURIComponent("técnica " + name + " short")}`;
  };

  const renderExerciseDetails = (ex) => {
    const info = getExerciseInfo(ex.name);
    const youtubeLink = getYoutubeUrl(ex.name);
    const eresFitnessLink = getEresFitnessUrl(ex.name);

    return (
      <div className="details-content">
        <div className="text-container">
          <p className="exercise-desc">{info.desc}</p>
          <div className="exercise-tips">
              <strong>🧠 Claves Técnicas:</strong>
              <ul>{info.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div className="buttons-row">
            <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="btn-action btn-youtube">
              <span>Ver Short/Video</span>
              <YouTubeIcon className="btn-icon" />
            </a>
            <a href={eresFitnessLink} target="_blank" rel="noopener noreferrer" className="btn-action btn-eres">
              <span>Leer Guía</span>
              <AutoStoriesIcon className="btn-icon" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (loadingPlan) return <div style={{color:'white', padding:20, textAlign:'center'}}>Generando tu plan...</div>;
  if (error) return <div style={{color:'white', padding:20, textAlign:'center'}}>{error}</div>;
  if (!plan) return null;

  const exercisesForDay = plan[selectedDay] || {};
  const flatExercises = Object.values(exercisesForDay).flat();
  const completedCount = flatExercises.filter((ex) => !!completed[selectedDay]?.[sanitizeId(ex.name)]).length;
  const totalCount = flatExercises.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="exercises-container">
      <div className="ExerciseH2" data-aos="fade-down">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
            <h2>Entrenamiento del Día</h2>
            {/* Botón discreto para reiniciar manualmente si el usuario quiere */}
            <button onClick={handleManualReset} className="reset-week-btn" title="Reiniciar semana">
                <RestartAltIcon />
            </button>
        </div>

        <select
          value={selectedDay}
          onChange={(e) => { setSelectedDay(e.target.value); localStorage.setItem("selectedDay", e.target.value); }}
          className="day-selector"
        >
          {Object.keys(plan).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="daily-progress">
            <div className="progress-bar-new" style={{ width: `${progressPercent}%` }}></div>
            <div className="progress-bar-completed" style={{position:'relative', zIndex:2}}>{completedCount} / {totalCount} completados</div>
        </div>
      </div>

      {Object.entries(exercisesForDay).map(([muscleGroup, groupExs]) => (
        <div key={muscleGroup} className="card" data-aos="fade-up">
          <div className="exerciseTitle">
            <img className="iconExercise" src={`./${muscleGroup.toLowerCase().replace(/\s+/g, "")}.svg`} alt="" onError={(e)=>e.target.style.display='none'} />
            <h3 style={{textTransform:'capitalize'}}>{muscleGroup}</h3>
          </div>

          <div className="exercise-cards">
            {groupExs.map((ex) => {
              const id = sanitizeId(ex.name);
              const isDone = !!completed[selectedDay]?.[id];

              return (
                <Accordion key={id} className="custom-accordion">
                  <AccordionSummary expandIcon={<ExpandMoreIcon className="expand-icon" />}>
                    <div className={`accordion-header ${isDone ? 'exercise-done' : ''}`}>
                      <div className="checkbox-wrapper" onClick={(e) => { e.stopPropagation(); toggleCompleted(selectedDay, id); }}>
                          <input type="checkbox" checked={isDone} readOnly />
                          <div className="label-svg">
                             <svg viewBox="0 0 95 95">
                                 <rect x="30" y="20" width="50" height="50" fill="none" strokeWidth="5"></rect>
                                 <g transform="translate(0,-952.36222)"><path d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4" fill="none" strokeWidth="5" className="path1" /></g>
                             </svg>
                          </div>
                      </div>
                      <div className="header-info">
                        <span className="ex-name">{ex.name}</span>
                        <span className="ex-meta">{ex.sets} x {ex.reps} | {ex.rest}</span>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className="accordion-details">
                    {renderExerciseDetails(ex)}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exercises;