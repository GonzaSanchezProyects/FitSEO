import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { supabase } from "../supabaseClient"; 
import "./QRScanner.css";

const QRScanner = ({ onClose }) => {
  const [scanStatus, setScanStatus] = useState("scanning");
  const [message, setMessage] = useState("Alineá el QR dentro del marco");

  // ⚠️ ESTE ES EL TEXTO EXACTO QUE DEBE CONTENER EL QR QUE IMPRIMAS
  const CODIGO_SECRETO_GYM = "GYM_VITTA_ACCESO_2026";

  const handleScan = (detectedCodes) => {
    if (scanStatus !== "scanning" || !detectedCodes || detectedCodes.length === 0) return;

    const qrValue = detectedCodes[0].rawValue;

    // 1. Iniciar el estado de carga al instante
    setScanStatus("loading");
    setMessage("Analizando código QR...");

    // ⏱️ 2. DEMORA ARTIFICIAL DE 2 SEGUNDOS
    setTimeout(async () => {
      
      // 🔒 AHORA SÍ ESTÁ ACTIVADA LA SEGURIDAD:
      if (qrValue !== CODIGO_SECRETO_GYM) {
        setScanStatus("error");
        setMessage("Código inválido. Este QR no pertenece al gimnasio.");
        
        // Vuelve a encender la cámara después de 3 segundos
        setTimeout(() => { 
          setScanStatus("scanning"); 
          setMessage("Alineá el QR dentro del marco"); 
        }, 3000);
        return; 
      }

      // Si el código es correcto, procedemos a registrar la asistencia...
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        
        // 👉 NUEVO: Extraemos el gym_id del usuario logueado
        const userDataStr = localStorage.getItem("userData");
        const gymId = userDataStr ? JSON.parse(userDataStr).gym_id : null;

        if (!userId || !gymId) throw new Error("No estás logueado o falta el ID del gimnasio.");

        // Verificar si YA marcó asistencia HOY
        const today = new Date().toISOString().split("T")[0]; 
        const { data: existingLogs, error: fetchError } = await supabase
          .from("access_logs")
          .select("id, check_in_time")
          .eq("user_id", userId)
          .eq("gym_id", gymId) // 👉 NUEVO: Filtro Multi-tenant
          .gte("check_in_time", `${today}T00:00:00Z`);

        if (fetchError) throw fetchError;

        if (existingLogs && existingLogs.length > 0) {
          setScanStatus("already_scanned");
          setMessage("¡Ya marcaste tu presente hoy!");
          setTimeout(() => onClose(), 3000);
          return;
        }

        // Registrar "Presente" en access_logs
        const { error: insertError } = await supabase
          .from("access_logs")
          .insert({
            user_id: userId,
            gym_id: gymId, // 👉 NUEVO: Inserción Multi-tenant
            check_in_time: new Date().toISOString(),
            access_granted: true,
            message: "Ingreso exitoso por QR"
          });

        if (insertError) throw insertError;

        // ¡Éxito!
        setScanStatus("success");
        setMessage("¡Presente! A entrenar con todo 💪");
        
        // Cerramos el escáner y recargamos la página para que se pinten las burbujas
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 2500); 

      } catch (err) {
        console.error(err);
        setScanStatus("error");
        setMessage("Error al conectar con la base de datos.");
        setTimeout(() => {
          setScanStatus("scanning");
          setMessage("Alineá el QR dentro del marco");
        }, 3000);
      }

    }, 2000); 
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-header">
        <button className="qr-close-btn" onClick={onClose}><FiX /></button>
        <span className="qr-title">Escanear Acceso</span>
        <div style={{ width: "40px" }}></div> 
      </div>

      {(scanStatus === "scanning" || scanStatus === "loading") && (
        <div className="scanner-container fade-in">
          <Scanner
            onScan={handleScan}
            formats={["qr_code"]}
            components={{ audio: false, tracker: true }}
            styles={{ container: { width: "100%", height: "100%" }, video: { objectFit: "cover" } }}
          />
          <div className="qr-cutout-overlay"></div>
          
          <div className="qr-instruction">
            {scanStatus === "loading" ? (
              <div className="qr-loading-badge pulse-anim">{message}</div>
            ) : (
              <span>{message}</span>
            )}
          </div>
        </div>
      )}

      {scanStatus === "success" && (
        <div className="qr-feedback-screen success fade-in">
          <FiCheckCircle className="feedback-icon pulse-anim" />
          <h2>{message}</h2>
        </div>
      )}

      {scanStatus === "already_scanned" && (
        <div className="qr-feedback-screen warning fade-in">
          <FiInfo className="feedback-icon" />
          <h2>{message}</h2>
        </div>
      )}

      {scanStatus === "error" && (
        <div className="qr-feedback-screen error fade-in">
          <FiAlertCircle className="feedback-icon shake-anim" />
          <h2>{message}</h2>
        </div>
      )}
    </div>
  );
};

export default QRScanner;