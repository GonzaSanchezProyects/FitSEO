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
    <nav className="app-nav" data-aos="fade-up" data-aos-delay="0" data-aos-offset="0" data-aos-duration="400">
      {/* 🔹 LADO IZQUIERDO */}
      <div className="nav-group left">
        <Link
          to="/exercises"
          className={active === "/exercises" ? "active" : ""}
          onClick={() => setActive("/exercises")}
        >
          <FaDumbbell />
          <span>Ejercicios</span>
        </Link>

        <Link
          to="/nutrition"
          className={active === "/nutrition" ? "active" : ""}
          onClick={() => setActive("/nutrition")}
        >
          <FaAppleAlt />
          <span>Nutrición</span>
        </Link>
      </div>

      <div className="qr-button">
        <Link
          to="/qr-reader"
          className={active === "/qr-reader" ? "active" : ""}
          onClick={() => setActive("/qr-reader")}
        >
          <FaQrcode />
        </Link>
      </div>

      {/* 🔹 LADO DERECHO */}
      <div className="nav-group right">
        <Link
          to="/membership"
          className={active === "/membership" ? "active" : ""}
          onClick={() => setActive("/membership")}
        >
          <FaCreditCard />
          <span>Cuota</span>
        </Link>

        <Link
          to="/login"
          className={active === "/login" ? "active" : ""}
          onClick={() => setActive("/login")}
        >
          <FaUser />
          <span>Perfil</span>
        </Link>
      </div>

      {/* 🟢 BURBUJA DE INICIO (arriba a la derecha) */}
      <div className="home-bubble">
        <Link
          to="/"
          className={active === "/" ? "active" : ""}
          onClick={() => setActive("/")}
        >
          <FaHome />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
