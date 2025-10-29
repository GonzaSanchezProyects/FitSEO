import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio/Inicio";
import Welcome from "./pages/welcome/Welcome";
import Login from "./pages/Login/Login";
import Exercises from "./pages/Exercises/Exercises";
import NutritionPlan from "./pages/NutritionPlan/NutritionPlan";
import MembershipStatus from "./pages/MembershipStatus/MembershipStatus";
import AOS from "aos";
import "aos/dist/aos.css";

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

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
      {!hideNavbar && <Navbar />}

      <main
        style={{
          paddingTop: window.innerWidth >= 768 && !hideNavbar ? "70px" : "0",
          paddingBottom: window.innerWidth < 768 && !hideNavbar ? "50px" : "0",
        }}
      >
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/nutrition" element={<NutritionPlan />} />
          <Route path="/membership" element={<MembershipStatus />} />
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
