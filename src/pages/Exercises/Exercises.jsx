import "./Exercises.css";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Exercises = () => {
  useEffect(() => {
    AOS.init({
      duration: 500, // duración de cada animación
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  let delayCounter = 0;
  const getDelay = () => {
    const delay = delayCounter * 100; // 100ms por elemento
    delayCounter += 1;
    return delay;
  };

  return (
    <div className="exercises-container">
      <div data-aos="fade-in" data-aos-duration="200" className="ExerciseH2">
        <h2>¿Qué toca hoy?</h2>
        <p>Lunes: Día de <strong>empuje</strong></p>
      </div>

      {/* --- PECHO --- */}
      <div data-aos="fade-in" data-aos-duration="200" className="card">
        <div className="exerciseTitle">
          <h3>Pecho</h3>
          <img className="iconExercise" src="./pecho.svg" alt="" />
        </div>
        <ul>
          {["Press de banca inclinado", "Press de banca plano", "Aperturas en fly deck"].map((ex, idx) => (
            <li
              key={idx}
              data-aos="fade-in"
              data-aos-delay={getDelay()}
            >
              <Accordion className="custom-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon className="expand-icon" />}>
                  {ex}
                </AccordionSummary>
                <AccordionDetails>
                  {ex === "Press de banca plano" && <img className="picExercise" src="./pressPlano.jpg" alt="" />}
                  Ejercicio de {ex.toLowerCase()}.
                </AccordionDetails>
              </Accordion>
            </li>
          ))}
        </ul>
      </div>

      {/* --- HOMBROS --- */}
      <div data-aos="fade-in" data-aos-duration="200" className="card">
        <div className="exerciseTitle">
          <h3>Hombros</h3>
          <img className="iconExercise" src="./hombro.svg" alt="" />
        </div>
        <ul>
          {["Press militar con mancuerna", "Vuelos laterales"].map((ex, idx) => (
            <li
              key={idx}
              data-aos="fade-in"
              data-aos-delay={getDelay()}
            >
              <Accordion className="custom-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon className="expand-icon" />}>
                  {ex}
                </AccordionSummary>
                <AccordionDetails>
                  Ejercicio de {ex.toLowerCase()}.
                </AccordionDetails>
              </Accordion>
            </li>
          ))}
        </ul>
      </div>

      {/* --- TRÍCEPS --- */}
      <div data-aos="fade-in" data-aos-duration="200" className="card">
        <div className="exerciseTitle">
          <h3>Tríceps</h3>
          <img className="iconExercise" src="./tricep.svg" alt="" />
        </div>
        <ul>
          {["Extensión de tríceps en polea", "Rompecráneos"].map((ex, idx) => (
            <li
              key={idx}
              data-aos="fade-in"
            >
              <Accordion className="custom-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon className="expand-icon" />}>
                  {ex}
                </AccordionSummary>
                <AccordionDetails>
                  Ejercicio de {ex.toLowerCase()}.
                </AccordionDetails>
              </Accordion>
            </li>
          ))}
        </ul>
      </div>

      {/* --- CHECKBOXES --- */}
      <section data-aos="fade-in" data-aos-duration="200" className="todo-section">
        <h4 className="todo-title">Ejercicios completados</h4>

        {[
          "Press de banca inclinado",
          "Press de banca plano",
          "Aperturas en Fly Deck",
          "Press militar con mancuernas",
          "Vuelos Laterales",
          "Extencion de triceps en polea",
          "Rompecraneos",
        ].map((id, index) => (
          <div
            className="checkbox-wrapper"
            key={id}
            data-aos="fade-in"
            data-aos-delay={index * 100} // cada checkbox aparece con 100ms de diferencia
            data-aos-duration="300"
          >
            <input type="checkbox" className="check" id={id} />
            <label htmlFor={id} className="label">
              <svg width="45" height="45" viewBox="0 0 95 95">
                <rect x="30" y="20" width="50" height="50" stroke="black" fill="none" />
                <g transform="translate(0,-952.36222)">
                  <path
                    d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
                    stroke="black"
                    strokeWidth="3"
                    fill="none"
                    className="path1"
                  />
                </g>
              </svg>
              <span>{id}</span>
            </label>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Exercises;
