import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio/Inicio";
import Welcome from "./pages/welcome/Welcome";
import Perfil from "./pages/Perfil/Perfil";
import Login from "./pages/Login/Login";
import Exercises from "./pages/Exercises/Exercises";
import NutritionPlan from "./pages/NutritionPlan/NutritionPlan";
import MembershipStatus from "./pages/MembershipStatus/MembershipStatus";
import RutinesForm from "./pages/RutinesForm/RutinesForm";
import NutritionForm from "./pages/NutritionForm/NutritionForm";
import QRScanner from "./components/QRScanner";
import AOS from "aos";
import "aos/dist/aos.css";

// 🔹 Componente rápido para envolver el Escáner y manejar el botón de "Cerrar" (X)
const QRPage = () => {
  const navigate = useNavigate();
  // Cuando el escaneo termina o el usuario toca la X, vuelve al Inicio
  return <QRScanner onClose={() => navigate("/")} />;
};

const AppContent = () => {
  const location = useLocation();
  
  // 🔹 Lista de rutas donde queremos ocultar el Navbar inferior (Pantalla completa)
  const hideNavbarPaths = [
    "/welcome", 
    "/login", 
    "/rutinesForm", 
    "/nutritionForm", 
    "/qr-reader" // 👈 Agregamos el QR aquí
  ];
  
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  useEffect(() => {
    AOS.init({
      duration: 800, // duración de animación (ms)
      offset: 100,   // distancia para activar animación
      delay: 0,      // sin retraso por defecto
      once: true,    // solo una vez al hacer scroll
      easing: "ease-in-out", // tipo de animación
    });
  }, []);

  return (
    <div className="app-container">
      {/* Muestra el Navbar solo si NO estamos en una ruta de pantalla completa */}
      {!hideNavbar && <Navbar />}

      <main
        style={{
          paddingTop: window.innerWidth >= 768 && !hideNavbar ? "70px" : "0",
          paddingBottom: window.innerWidth < 768 && !hideNavbar ? "50px" : "0",
        }}
      >
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/rutinesForm" element={<RutinesForm />} />
          <Route path="/nutritionForm" element={<NutritionForm />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/nutrition" element={<NutritionPlan />} />
          <Route path="/membership" element={<MembershipStatus />} />   
          
          {/* 👉 NUEVA RUTA: Conectamos el botón central del Navbar */}
          <Route path="/qr-reader" element={<QRPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;