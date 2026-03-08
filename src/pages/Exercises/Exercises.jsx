import "./Exercises.css";
import { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import YouTubeIcon from "@mui/icons-material/YouTube"; 
import AutoStoriesIcon from "@mui/icons-material/AutoStories"; 
import { useNavigate } from "react-router-dom"; // 👉 Ya estaba importado, ¡genial!
import { supabase } from "../../supabaseClient"; 
import { FiActivity, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

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

/* ---------- INFO TEXTUAL (Tips) ---------- */
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

/* ---------- COMPONENTE PRINCIPAL ---------- */
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

  const checkWeeklyReset = () => {
    const startDateStr = localStorage.getItem("weekStartDate");
    const now = new Date();
    if (!startDateStr) {
      localStorage.setItem("weekStartDate", now.toISOString());
    } else {
      const startDate = new Date(startDateStr);
      const diffTime = Math.abs(now - startDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays >= 7) {
        setCompleted({});
        localStorage.setItem("completedExercises_v4", JSON.stringify({}));
        localStorage.setItem("weekStartDate", now.toISOString());
      }
    }
  };

  const handleManualReset = () => {
    if(window.confirm("¿Quieres reiniciar toda la semana y desmarcar todo?")) {
        setCompleted({});
        localStorage.setItem("completedExercises_v4", JSON.stringify({}));
        localStorage.setItem("weekStartDate", new Date().toISOString());
    }
  };

  const fetchRoutineFromDB = async () => {
    setLoadingPlan(true);
    setError("");

    try {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;

      // 👉 VALIDACIÓN DE RUTA: Si no hay usuario, mandamos al login inmediatamente
      if (!userId) {
        navigate("/login");
        return; // Cortamos la ejecución aquí
      }

      const { data: routine, error: dbError } = await supabase
        .from('routines')
        .select(`
          id, name,
          routine_days (
            id, day_name, order_index,
            muscle_blocks (
              id, muscle_name, order_index,
              exercises (
                id, name, sets, reps, video_url
              )
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single(); 

      if (dbError || !routine) {
        setPlan(null);
        setLoadingPlan(false);
        return;
      }

      const fetchedPlan = {};
      const days = routine.routine_days.sort((a, b) => a.order_index - b.order_index);

      days.forEach(day => {
        const blocksObj = {};
        const blocks = day.muscle_blocks.sort((a, b) => a.order_index - b.order_index);
        
        blocks.forEach(block => {
          blocksObj[block.muscle_name] = block.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps, 
            video_url: ex.video_url
          }));
        });
        fetchedPlan[day.day_name] = blocksObj;
      });

      setPlan(fetchedPlan);

      const savedDay = localStorage.getItem("selectedDay");
      if (!savedDay || !fetchedPlan[savedDay]) {
        if (days.length > 0) {
          setSelectedDay(days[0].day_name);
          localStorage.setItem("selectedDay", days[0].day_name);
        }
      }

    } catch (err) {
      console.error("Error al obtener la rutina:", err);
      setError("Hubo un problema al cargar tu rutina.");
    } finally {
      if (mountedRef.current) setLoadingPlan(false);
    }
  };

  useEffect(() => { 
    mountedRef.current = true; 
    AOS.init({duration:500}); 
    checkWeeklyReset();
    fetchRoutineFromDB();
    return () => { mountedRef.current = false; }; 
  }, []);

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
    const cleanName = exerciseName.replace("(Adaptado)", "").trim();
    return `https://eresfitness.com/?s=${encodeURIComponent(cleanName)}`;
  };

  const getYoutubeUrl = (ex) => {
    if (ex.video_url) return ex.video_url;
    const cleanName = ex.name.replace("(Adaptado)", "").trim();
    const id = videoIds[cleanName];
    return id 
      ? `https://www.youtube.com/watch?v=${id}` 
      : `https://www.youtube.com/results?search_query=${encodeURIComponent("técnica " + cleanName + " short")}`;
  };

  const renderExerciseDetails = (ex) => {
    const info = getExerciseInfo(ex.name);
    const youtubeLink = getYoutubeUrl(ex);
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

  // --- ESTADOS DE CARGA Y VACÍO (Premium) ---
  if (loadingPlan) return (
    <div className="dashboard-container exercises-container">
      <div className="status-state-card fade-in">
        <div className="spinner-wrapper">
          <FiRefreshCw className="spinning-icon" />
        </div>
        <h2>Sincronizando...</h2>
        <p>Obteniendo tu rutina desde la base de datos.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container exercises-container">
      <div className="status-state-card error-card fade-in">
        <div className="icon-wrapper error">
          <FiAlertCircle />
        </div>
        <h2>Ocurrió un error</h2>
        <p>{error}</p>
        <button className="btn-primary glow-btn mt-2" onClick={fetchRoutineFromDB}>Reintentar</button>
      </div>
    </div>
  );
  
  if (!plan || Object.keys(plan).length === 0) return (
    <div className="dashboard-container exercises-container">
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Entrenamiento</p>
          <h1 className="user-name">Sin Rutina</h1>
        </div>
      </header>

      <div className="status-state-card empty-card slide-up">
        <div className="icon-wrapper empty">
          <FiActivity />
        </div>
        <h2>Aún no tienes rutina</h2>
        <p>Tu plan de entrenamiento está vacío. Ve a tu perfil y genera uno personalizado basado en tus objetivos y experiencia.</p>
        <button className="btn-primary glow-btn mt-2" onClick={() => navigate('/rutinesForm')}>
          Generar mi Rutina
        </button>
      </div>
    </div>
  );

  // --- RENDERIZADO DE LA RUTINA ---
  const exercisesForDay = plan[selectedDay] || {};
  const flatExercises = Object.values(exercisesForDay).flat();
  const completedCount = flatExercises.filter((ex) => !!completed[selectedDay]?.[ex.id]).length;
  const totalCount = flatExercises.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="dashboard-container exercises-container">
      
      <header className="dashboard-header fade-in">
        <div>
          <p className="greeting">Seguimiento diario</p>
          <h1 className="user-name">Entrenamiento</h1>
        </div>
      </header>

      {/* PANEL DE CONTROL DEL DÍA */}
      <section className="bento-card day-control-panel slide-up">
        <div className="day-control-header">
          <select
            value={selectedDay}
            onChange={(e) => { setSelectedDay(e.target.value); localStorage.setItem("selectedDay", e.target.value); }}
            className="day-selector glass-select"
          >
            {Object.keys(plan).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={handleManualReset} className="reset-week-btn" title="Reiniciar semana">
              <FiRefreshCw />
          </button>
        </div>
        
        <div className="daily-progress">
            <div className="progress-bar-new" style={{ width: `${progressPercent}%` }}></div>
            <div className="progress-bar-completed">{completedCount} / {totalCount} completados</div>
        </div>
      </section>

      {/* BLOQUES MUSCULARES */}
      <div className="bento-grid">
        {Object.entries(exercisesForDay).map(([muscleGroup, groupExs], idx) => (
          <div key={muscleGroup} className="bento-card muscle-block-card slide-up" style={{ animationDelay: `${0.1 + (idx * 0.1)}s` }}>
            <div className="exerciseTitle">
              <img className="iconExercise" src={`./${muscleGroup.toLowerCase().replace(/\s+/g, "")}.svg`} alt="" onError={(e)=>e.target.style.display='none'} />
              <h3>{muscleGroup}</h3>
            </div>

            <div className="exercise-cards">
              {groupExs.map((ex) => {
                const exId = ex.id; 
                const isDone = !!completed[selectedDay]?.[exId];

                return (
                  <Accordion key={exId} className="custom-accordion">
                    <AccordionSummary expandIcon={<ExpandMoreIcon className="expand-icon" />}>
                      <div className={`accordion-header ${isDone ? 'exercise-done' : ''}`}>
                        <div className="checkbox-wrapper" onClick={(e) => { e.stopPropagation(); toggleCompleted(selectedDay, exId); }}>
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
                          <span className="ex-meta">{ex.sets} x {ex.reps}</span>
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
    </div>
  );
};

export default Exercises;