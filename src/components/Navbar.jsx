import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaDumbbell,
  FaAppleAlt,
  FaCreditCard,
  FaUser,
  FaQrcode,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  return (
    <>
      {/* 🟢 BURBUJA DE INICIO (Separada del nav para que flote libremente) */}
      <div className="home-bubble" data-aos="fade-in" data-aos-duration="600">
        <Link
          to="/"
          className={active === "/" ? "active bubble-link" : "bubble-link"}
          onClick={() => setActive("/")}
        >
          <FaHome />
        </Link>
      </div>

      {/* 🔵 NAVBAR GLASSMORPHISM */}
      <nav className="app-nav" data-aos="fade-up" data-aos-delay="0" data-aos-offset="0" data-aos-duration="400">
        
        {/* LADO IZQUIERDO */}
        <div className="nav-group left">
          <Link
            to="/exercises"
            className={active === "/exercises" ? "active nav-item" : "nav-item"}
            onClick={() => setActive("/exercises")}
          >
            <FaDumbbell className="nav-icon" />
            <span>Ejercicios</span>
          </Link>

          <Link
            to="/nutrition"
            className={active === "/nutrition" ? "active nav-item" : "nav-item"}
            onClick={() => setActive("/nutrition")}
          >
            <FaAppleAlt className="nav-icon" />
            <span>Nutrición</span>
          </Link>
        </div>

        {/* BOTÓN QR CENTRAL */}
        <div className="qr-button-wrapper">
          <Link
            to="/qr-reader"
            className={active === "/" ? "active qr-link" : "qr-link"}
            onClick={() => setActive("/qr-reader")}
          >
            <FaQrcode />
          </Link>
        </div>

        {/* LADO DERECHO */}
        <div className="nav-group right">
          <Link
            to="/membership"
            className={active === "/membership" ? "active nav-item" : "nav-item"}
            onClick={() => setActive("/membership")}
          >
            <FaCreditCard className="nav-icon" />
            <span>Cuota</span>
          </Link>

          <Link
            to="/perfil"
            className={active === "/perfil" ? "active nav-item" : "nav-item"}
            onClick={() => setActive("/perfil")}
          >
            <FaUser className="nav-icon" />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;