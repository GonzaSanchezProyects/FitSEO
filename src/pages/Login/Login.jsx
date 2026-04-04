import React, { useState } from "react";
// 👉 IMPORTANTE: Ajustá la ruta según dónde tengas tu archivo de configuración de Supabase
import { supabase } from "../../supabaseClient"; 
import "./Login.css";

const Login = () => {
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
      const { data: authData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: login, 
        password: password,
      });

      if (supabaseError) {
        throw new Error(
          supabaseError.message === "Invalid login credentials" 
            ? "Correo o contraseña incorrectos" 
            : supabaseError.message
        );
      }

      // 2. 👉 BUSCAMOS EN CLIENTES (Usando maybeSingle para evitar el error 404 en consola)
      let { data: profileData, error: profileError } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', login)
        .maybeSingle();

      let isStaffMode = false;

      // 3. 👉 PLAN B: Si no es un cliente, vemos si es un Administrador probando la app
      if (!profileData) {
        const { data: staffData } = await supabase
          .from('users')
          .select('*')
          .eq('email', login)
          .maybeSingle();

        if (staffData) {
          profileData = staffData;
          isStaffMode = true; // Entró un admin
        }
      }

      // 4. Si definitivamente no está en ninguna de las dos tablas, lo rebotamos
      if (!profileData) {
        await supabase.auth.signOut();
        throw new Error("No se encontró el perfil asociado a este correo.");
      }

      // 5. Verificar si está dado de baja (Baja Lógica)
      if (profileData.enabled === false) {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta se encuentra inactiva. Comunicate con recepción.");
      }

      console.log(isStaffMode ? "Login de Admin (Modo Prueba)" : "Login de Alumno:", profileData);

      // 6. Extraer Token y guardar en localStorage
      const token = authData.session.access_token;

      if (token) {
        localStorage.setItem("crmToken", token);
      }

      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...profileData, 
          login: authData.user.email,
          isAuthenticated: true,
          role: isStaffMode ? "admin" : "user",
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
              type="email"
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