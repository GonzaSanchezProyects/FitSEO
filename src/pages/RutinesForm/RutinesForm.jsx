import React, { useState } from "react";
import "./RutinesForm.css";

const RutinesForm = ({ onGenerarRutina, onGuardarRutina }) => {
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    emailUsuario: "",
    dias: 3,
    nivel: "principiante",
    objetivo: "hipertrofia",
    notas: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
  const handleGenerar = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Si en el futuro se integra IA:
    if (onGenerarRutina) {
      await onGenerarRutina(formData);
    }

    setLoading(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Si en el futuro se integra CRM/Base de datos:
    if (onGuardarRutina) {
      await onGuardarRutina(formData);
    }
  };

  return (
    <div className="formContainer">
        <form className="form-rutina">
        <h2>Crear Rutina Personalizada</h2>

        <div className="campo">
            <label>Nombre del usuario:</label>
            <input
            type="text"
            name="nombreUsuario"
            value={formData.nombreUsuario}
            onChange={handleChange}
            placeholder="Ej: Gonzalo"
            required
            />
        </div>

        <div className="campo">
            <label>Días por semana:</label>
            <select name="dias" value={formData.dias} onChange={handleChange}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            </select>
        </div>

        <div className="campo">
            <label>Edad (Años):</label>
            <input type="number" />
        </div>

        <div className="campo">
            <label>Nivel:</label>
            <select name="nivel" value={formData.nivel} onChange={handleChange}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
            </select>
        </div>

        <div className="campo">
            <label>Objetivo:</label>
            <select name="objetivo" value={formData.objetivo} onChange={handleChange}>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="definición">Definición</option>
            <option value="fuerza">Fuerza</option>
            </select>
        </div>

        <div className="campo">
            <label>Notas adicionales (opcional):</label>
            <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Ej: Evitar ejercicios de hombros, lesión previa..."
            />
        </div>

        <div className="botones">
            <button onClick={handleGenerar} disabled={loading}>
            {loading ? "Generando..." : "Generar con IA"}
            </button>
            <button type="button" onClick={handleLimpiar}>Limpiar
            </button>
        </div>
        </form>
    </div>
  );
};

export default RutinesForm;
