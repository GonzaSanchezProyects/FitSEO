import "./Welcome.css";

const Welcome = () => {
  return (
    <div className="home-container">
      <div className="hero">
        <h1>FitSEO</h1>
        <p>Transformá tu cuerpo, empezá hoy</p>
        <a href="./inicio">
            <button onClick={() => navigate("/inicio")}>Comenzar</button>
        </a>

      </div>
    </div>
  );
};

export default Welcome;
