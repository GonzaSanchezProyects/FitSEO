import React, { useState } from "react";
// 👉 IMPORTANTE: Ajustá la ruta según dónde tengas tu archivo de configuración de Supabase
import { supabase } from "../../supabaseClient"; 
import "./Login.css";

const Login = () => {
  // Supabase por defecto usa Email para el login
  const [login, setLogin] = useState("");  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Llamada a la autenticación nativa de Supabase
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: login, 
        password: password,
      });

      // 2. Manejo de errores de Supabase
      if (supabaseError) {
        throw new Error(
          supabaseError.message === "Invalid login credentials" 
            ? "Correo o contraseña incorrectos" 
            : supabaseError.message
        );
      }

      console.log("Login exitoso con Supabase:", data);

      // 3. Extraer Token y ID del usuario desde la respuesta de Supabase
      const token = data.session.access_token;
      const userId = data.user.id;

      // 4. Guardar en localStorage manteniendo la compatibilidad con el resto de tu app (RoutinesForm, etc.)
      if (token) {
        localStorage.setItem("crmToken", token);
      }

      localStorage.setItem(
        "userData",
        JSON.stringify({
          login: data.user.email,
          isAuthenticated: true,
          id: userId,
          role: "user", // Supabase maneja roles en tablas aparte, por ahora lo dejamos default
          loginTime: new Date().toISOString(),
        })
      );

      setSuccess("¡Inicio de sesión exitoso!");

      setTimeout(() => {
        window.location.href = "/inicio";
      }, 1500);

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message || "Error al conectar con Supabase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card slide-up">
        
        <div className="login-header">
          <div className="login-icon">💪</div>
          <h2 className="login-title">Bienvenido</h2>
          <p className="login-subtitle">Ingresa a tu panel de progreso</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          
          {error && <div className="login-alert error">{error}</div>}
          {success && <div className="login-alert success">{success}</div>}

          <div className="form-group">
            <label className="login-label">Correo Electrónico</label>
            <input
              type="email" /* Supabase requiere email válido por defecto */
              className="glass-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary login-button" disabled={loading}>
            {loading ? <span className="loader-text">Conectando...</span> : "Ingresar"}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Login;