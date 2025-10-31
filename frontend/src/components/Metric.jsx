import React from "react";
import "../styles/Metric.css";

const Metric = ({ title, value, icon, prefix = "", suffix = "" }) => {
  return (
    <div className="metric-card">
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <h2>{prefix}{value}{suffix}</h2>
    </div>
  );
};

export default Metric;
