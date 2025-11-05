import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState(""); // input controlado
  const [password, setPassword] = useState(""); // input controlado
  const [role, setRole] = useState("SUPER_ADMIN"); // rol por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // nuevo estado para mensaje de éxito

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "https://crmgym-backend-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciales incorrectas");
      }

      const data = await response.json();

      // Guardar token
      localStorage.setItem("crmToken", data.token || data.accessToken);

      // Mostrar mensaje de éxito
      setSuccess("¡Inicio de sesión exitoso ✅!");

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = "/inicio";
      }, 1500);

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}

        <label className="login-label">Usuario</label>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="login-label">Contraseña</label>
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Iniciando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
