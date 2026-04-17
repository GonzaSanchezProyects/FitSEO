import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; 
import { useNavigate } from "react-router-dom";

const QRPage = () => {
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    // Extraemos la información del usuario logueado
    const userDataStr = localStorage.getItem("userData");
    
    if (!userDataStr) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userDataStr);
    
    // 👉 NUEVO: Creamos el Payload que incluye el DNI y a qué gimnasio pertenece
    const payload = {
      dni: userData.dni,
    };

    // Convertimos el objeto en una cadena para el código QR
    setQrData(JSON.stringify(payload));
  }, [navigate]);

  return (
    <div 
      className="dashboard-container" 
      style={{ 
        display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', 
        minHeight: '80vh', padding: '20px' 
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0' }}>Pase de Ingreso</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
          Mostrá este código en la recepción de tu gimnasio
        </p>
      </div>
      
      {/* Contenedor del QR estilo Glassmorphism */}
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '30px', 
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {qrData ? (
          <QRCodeSVG 
            value={qrData} 
            size={220} 
            level="H" // High error correction
            includeMargin={false}
            fgColor="#0f172a"
          />
        ) : (
          <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justify: 'center' }}>
            Generando código...
          </div>
        )}
      </div>
      
      <button 
        onClick={() => navigate("/")} 
        className="btn-primary" 
        style={{ marginTop: '40px', width: '100%', maxWidth: '300px' }}
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default QRPage;