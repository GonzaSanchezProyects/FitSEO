import React from "react";
import "./NutritionPlan.css";
import { FaAppleAlt, FaCarrot, FaBreadSlice, FaEgg } from "react-icons/fa";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";


const NutritionPlan = () => {

    const proteinRoot = React.useRef(null);
    const carbsRoot = React.useRef(null);
    const fatRoot = React.useRef(null);

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
  return (
    <div className="nutrition-container">
      <div data-aos="fade-in" data-aos-duration="200"  className="title">
        <h2 className="mainTitle">Plan Nutricional</h2>
        <p>Lunes</p>
      </div>
      

      <section data-aos="fade-in" data-aos-duration="200" className="chart-section boxShadowSection nutricionSection2">
        <h3>Macronutrientes</h3>
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
      </section>
      <div className="dietaContainer">
        <h2 className="nutrition-title">Tu dieta</h2>

        {/* --- DESAYUNO --- */}
        <div data-aos="fade-up" data-aos-duration="300" className="meal-card">
          <h3 className="meal-title">Desayuno</h3>
          <ul className="meal-list">
            <li className="meal-item">
              <span className="food-name">Avena con leche</span>
              <span className="food-macros">250 kcal | 12g P | 40g C | 6g G</span>
            </li>
            <li className="meal-item">
              <span className="food-name">Banana</span>
              <span className="food-macros">90 kcal | 1g P | 23g C | 0g G</span>
            </li>
          </ul>
        </div>

        {/* --- ALMUERZO --- */}
        <div data-aos="fade-up" data-aos-duration="300" className="meal-card">
          <h3 className="meal-title">Almuerzo</h3>
          <ul className="meal-list">
            <li className="meal-item">
              <span className="food-name">Pechuga de pollo</span>
              <span className="food-macros">180 kcal | 35g P | 0g C | 4g G</span>
            </li>
            <li className="meal-item">
              <span className="food-name">Arroz integral</span>
              <span className="food-macros">220 kcal | 6g P | 45g C | 2g G</span>
            </li>
          </ul>
        </div>

        {/* --- CENA --- */}
        <div data-aos="fade-up" data-aos-duration="300" className="meal-card">
          <h3 className="meal-title">Cena</h3>
          <ul className="meal-list">
            <li className="meal-item">
              <span className="food-name">Merluza al horno</span>
              <span className="food-macros">200 kcal | 30g P | 0g C | 7g G</span>
            </li>
            <li className="meal-item">
              <span className="food-name">Puré de calabaza</span>
              <span className="food-macros">120 kcal | 2g P | 25g C | 1g G</span>
            </li>
          </ul>
        </div>

        {/* --- COLACIONES --- */}
        <div data-aos="fade-up" data-aos-duration="300" className="meal-card">
          <h3 className="meal-title">Colaciones</h3>
          <ul className="meal-list">
            <li className="meal-item">
              <span className="food-name">Yogur griego</span>
              <span className="food-macros">90 kcal | 10g P | 8g C | 2g G</span>
            </li>
            <li className="meal-item">
              <span className="food-name">Frutos secos (30g)</span>
              <span className="food-macros">180 kcal | 5g P | 5g C | 15g G</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NutritionPlan;
