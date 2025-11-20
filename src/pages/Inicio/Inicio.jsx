import React from "react";
import "./Inicio.css";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Inicio = () => {

  const navigate = useNavigate();
    useEffect(() => {
          const userData = JSON.parse(localStorage.getItem("userData"));
          if (!userData?.isAuthenticated) {
            navigate("/login");
          }
    }, [navigate]);

  const userName = "Gonzalo";

  // --- REFS ---
  const pesoChartRef = React.useRef(null);
  const proteinRoot = React.useRef(null);
  const carbsRoot = React.useRef(null);
  const fatRoot = React.useRef(null);

  // --- GRÁFICO PESO CORPORAL (AmCharts) ---
  React.useLayoutEffect(() => {
    if (pesoChartRef.current) {
      pesoChartRef.current.dispose();
    }

    const root = am5.Root.new("pesoChart");
    pesoChartRef.current = root;

    // 🔹 Ocultar el logo de amCharts
    root._logo.dispose();

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        height: am5.percent(110),
        width: am5.percent(110),
      })
    );


    const data = Array(15)
      .fill(0)
      .map((_, i) => ({
        day: i + 1, // 🔹 Usamos números en lugar de texto
        peso: 75 - Math.random() * 5,
      }));

    // 🔹 Eje X numérico
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 40,
        }),
        min: 1,
        max: 15,
        strictMinMax: true,
        numberFormat: "#",
      })
    );

    // 🔹 Mostrar etiqueta cada 5 días exactos
    xAxis.set("interval", 5);

    // 🔹 Eje Y
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 65,
        max: 80,
      })
    );

    // 🔹 Serie de línea suavizada
    const series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Peso corporal",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "peso",
        valueXField: "day",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY} kg",
        }),
        stroke: am5.color(0x126782),
        fill: am5.color(0x126782),
        tension: 0.1,
      })
    );

    series.data.setAll(data);

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.2,
    });

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0xffffff),
          stroke: series.get("stroke"),
          strokeWidth: 2,
        }),
      })
    );

    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);



  // --- GRÁFICOS NUTRICIONALES ---
  React.useLayoutEffect(() => {
    const createRing = (ref, divId, color, percentage, restColor) => {
      if (!ref.current) {
        const root = am5.Root.new(divId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(60),
          })
        );

        const series = chart.series.push(
          am5percent.PieSeries.new(root, {
            valueField: "value",
            categoryField: "category",
          })
        );

        const data = [
          { category: "Consumido", value: percentage, fill: am5.color(color) },
          { category: "Restante", value: 100 - percentage, fill: am5.color(restColor) },
        ];

        series.data.setAll(data);

        series.slices.template.setAll({
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
        });

        series.events.on("datavalidated", () => {
          series.slices.each((slice, index) => {
            slice.set("fill", data[index].fill);
          });
        });

        series.appear(1000, 500);

        ref.current = root;
      }
    };

    createRing(proteinRoot, "proteinRing", "#4CAF50", 60, "#C8E6C9");
    createRing(carbsRoot, "carbsRing", "#FF9800", 45, "#FFE0B2");
    createRing(fatRoot, "fatRing", "#2196F3", 30, "#BBDEFB");

    return () => {
      [proteinRoot, carbsRoot, fatRoot].forEach((r) => {
        r.current?.dispose();
        r.current = null;
      });
    };
  }, []);

  // --- ASISTENCIA ---
  const asistencia30dias = Array(30)
    .fill(0)
    .map(() => (Math.random() > 0.5 ? 1 : 0));

  return (
    <div className="inicio-container">
      <section className="inicio-header">
        <h2>¡Hola, {userName}! 👋</h2>
        <p>Bienvenido a tu panel de progreso</p>
        <span className="cuota">Estado de tu cuota: <strong>Activa</strong> (Restan: 7 dias)</span>
      </section>

      {/* --- PESO CORPORAL (NUEVO) --- */}
      <section data-aos="fade-in"  data-aos-duration="200" className="chart-section boxShadowSection">
        <h3>Evolución de tu peso corporal (últimos 15 días)</h3>
        <div className="DivChart">
          <div id="pesoChart" style={{ width: "100%", height: "150px"}}></div>
        </div>
        <p className="chart-reference">
          Cada punto representa tu peso diario registrado (kg)
        </p>
      </section>

      {/* --- NUTRICIÓN --- */}
      <section data-aos="fade-in"  data-aos-duration="200" className="chart-section boxShadowSection nutricionSection">
        <h3>Tu resumen nutricional</h3>
        <div className="macros-container">
          <div className="macro-item">
            <div id="proteinRing" className="macro-ring">
              <span style={{ color: "#4CAF50" }} className="ratio">30%</span>
            </div>
            <p className="macro-label protein">Proteínas</p>
            <p className="macro-restante">139g rest.</p>
          </div>
          <div className="macro-item">
            <div id="carbsRing" className="macro-ring">
              <span style={{ color: "#FF9800" }} className="ratio">20%</span>
            </div>
            <p className="macro-label carbs">Carbohidratos</p>
            <p className="macro-restante">278g rest.</p>
          </div>
          <div className="macro-item">
            <div id="fatRing" className="macro-ring">
              <span style={{ color: "#2196F3" }} className="ratio">80%</span>
            </div>
            <p className="macro-label fat">Grasas</p>
            <p className="macro-restante">61g rest.</p>
          </div>
        </div>
        <p className="meta-text">
          Te quedan <strong>2,230 calorías</strong> disponibles hoy
        </p>
      </section>

      {/* --- ASISTENCIA Y CUOTA --- */}
      <section data-aos="fade-in" data-aos-duration="200" className="chart-section status-section">
        <h3>Asistencia</h3>
        <div className="calendar-container" data-aos="fade-up">
          <div className="divCalendar">
            <h4>Noviembre</h4>
            <div className="week-days">
              {["L","M","X","J","V","S","D"].map((d, idx) => (
                <div key={idx} className="week-day">{d}</div>
              ))}
            </div>
            <div className="calendar">
              {asistencia30dias.map((dia, idx) => {
                const dayOfWeek = idx % 7;
                const delay = idx * 50; // <--- incremento del delay para efecto escalonado

                return (
                  <div
                    key={idx}
                    className={`calendar-day ${dia ? "active" : ""} ${dayOfWeek === 6 ? "domingo" : ""}`}
                    title={`Día ${idx + 1}: ${dia ? "Asistió" : "No asistió"}`}
                    data-aos="fade-up"
                    data-aos-delay={delay}        // <--- delay por cada día
                    data-aos-duration="300"       // <--- duración de la animación de cada día
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --- RESUMEN FINAL --- */}
      <section data-aos="fade-in"  data-aos-duration="200" className="summary-section boxShadowSection">
        <h3>Resumen</h3>
        <ul>
          <li>
            <strong>Peso actual:</strong> 72.8 kg
          </li>
          <li>
            <strong>IMC:</strong> 23.5
          </li>
          <li>
            <strong>Objetivo:</strong> Definición muscular 💪
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Inicio;
