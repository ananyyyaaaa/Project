import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [district, setDistrict] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!district) return alert("Please select a district!");
    navigate(`/dashboard/${district}`);
  };

  return (
    <div className="home-container">
      <h1>MGNREGA Dashboard – Manipur</h1>
      <p>Select your district to see its performance and insights</p>

      <div className="dropdown-container">
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">-- Select District --</option>
          <option value="Imphal West">Imphal West</option>
          <option value="Imphal East">Imphal East</option>
          <option value="Thoubal">Thoubal</option>
          <option value="Churachandpur">Churachandpur</option>
          <option value="Ukhrul">Ukhrul</option>
        </select>
        <button onClick={handleSubmit}>View Dashboard</button>
      </div>
    </div>
  );
};

export default Home;
