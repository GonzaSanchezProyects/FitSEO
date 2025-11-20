import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [login, setLogin] = useState("");  // 👉 usa "login" como pide el backend
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // CONFIG: URL de Azure actualizada
  // ---------------------------------------------------------
  const API_URL = "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net/api/auth/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login,        // 👉 campo correcto requerido por swagger
            password      // 👉 campo correcto requerido por swagger
          }),
        }
      );

      if (!response.ok) {
        // Intentamos leer el mensaje de error del servidor
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || "Credenciales incorrectas o error en el servidor");
      }

      const data = await response.json();
      
      // DEBUG: Ver qué nos devuelve el login exactamente
      console.log("Login exitoso, datos recibidos:", data);

      // 1. Guardar token JWT
      // A veces viene como 'token', a veces como 'accessToken'
      const token = data.token || data.accessToken;
      if (token) {
        localStorage.setItem("crmToken", token);
      }

      // 2. Buscar el ID del usuario para usarlo en otros formularios
      // Intentamos varias propiedades comunes por si acaso
      const userId = data.id || data.userId || data.clientId || (data.user && data.user.id) || null;

      // 3. Guardar datos del usuario en localStorage
      localStorage.setItem(
        "userData",
        JSON.stringify({
          login,
          isAuthenticated: true,
          id: userId, // IMPORTANTE: Guardamos el ID para que RoutinesForm lo encuentre
          role: data.role || "user", // Si el backend manda rol, guardarlo
          loginTime: new Date().toISOString(),
        })
      );

      setSuccess("¡Inicio de sesión exitoso!");

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

        <label className="login-label">Usuario o Email</label>
        <input
          type="text"
          className="login-input"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
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