import React, { useState } from "react";
import "./NutritionForm.css";

const NutritionForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    objetivo: "",
    nivelActividad: "",
    restricciones: "",
    dias: 7,
  });

  const [dietaGenerada, setDietaGenerada] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerarDieta = (e) => {
    e.preventDefault();
    // 🚀 En el futuro: conectar con IA o CRM
    console.log("Datos enviados:", formData);

    // Simulación temporal
    const dietaEjemplo = {
      Lunes: "Desayuno: Avena con banana y miel\nAlmuerzo: Pollo con arroz\nCena: Ensalada con atún",
      Martes: "Desayuno: Yogur con granola\nAlmuerzo: Carne con batata\nCena: Omelette con verduras",
    };
    setDietaGenerada(dietaEjemplo);
  };

  const handleLimpiar = () => {
    setFormData({
      nombre: "",
      objetivo: "",
      nivelActividad: "",
      restricciones: "",
      dias: 7,
    });
    setDietaGenerada(null);
  };

  return (
    <div className="dietasContainer">
      <form className="form-dieta" onSubmit={handleGenerarDieta}>
        <h2>Crear Dieta Personalizada</h2>

        <div className="campo-dieta">
          <label>Nombre del usuario:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Gonzalo"
          />
        </div>

        <div className="campo-dieta">
          <label>Objetivo:</label>
          <select
            name="objetivo"
            value={formData.objetivo}
            onChange={handleChange}
          >
            <option value="">Seleccionar objetivo</option>
            <option value="definicion">Definición</option>
            <option value="volumen">Volumen</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="campo-dieta">
          <label>Peso Corporal:</label>
          <input type="number" />
        </div>

        <div className="campo-dieta">
          <label>Nivel de actividad física:</label>
          <select
            name="nivelActividad"
            value={formData.nivelActividad}
            onChange={handleChange}
          >
            <option value="">Seleccionar nivel</option>
            <option value="bajo">Bajo</option>
            <option value="moderado">Moderado</option>
            <option value="alto">Alto</option>
          </select>
        </div>

        <div className="campo-dieta">
          <label>Restricciones alimentarias:</label>
          <textarea
            name="restricciones"
            value={formData.restricciones}
            onChange={handleChange}
            placeholder="Ej: Sin lactosa, vegetariano, etc."
          />
        </div>

        <div className="campo-dieta">
          <label>Días de la dieta:</label>
          <select
            name="dias"
            value={formData.dias}
            onChange={handleChange}
          >
            <option value="3">3 días</option>
            <option value="5">5 días</option>
            <option value="7">7 días</option>
          </select>
        </div>

        <div className="botones">
  
            <div className="botones-dieta">
                <button type="button" onClick={handleLimpiar}>Generar con ia</button>
                <button type="button" onClick={handleLimpiar}>Limpiar</button>
           </div>
        </div>  
      </form>

      {dietaGenerada && (
        <div className="resultado-dieta">
          <h2>Dieta Generada</h2>
          {Object.entries(dietaGenerada).map(([dia, comidas]) => (
            <div key={dia} className="dia-dieta">
              <h3>{dia}</h3>
              <pre>{comidas}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionForm;
