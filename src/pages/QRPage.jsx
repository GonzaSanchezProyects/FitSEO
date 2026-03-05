import React from "react";
import { useNavigate } from "react-router-dom";
import QRScanner from "../components/QRScanner"; // 👉 Asegurate de que esta ruta apunte bien al archivo que creamos antes

const QRPage = () => {
  const navigate = useNavigate();

  // Cuando el escáner termine (éxito) o el usuario toque la "X", lo mandamos a la pantalla de inicio
  const handleClose = () => {
    navigate("/"); 
  };

  return <QRScanner onClose={handleClose} />;
};

export default QRPage;