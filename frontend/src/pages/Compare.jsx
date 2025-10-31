import React, { useState, useEffect } from "react";
import "../styles/Compare.css";
import { API_BASE_URL } from "../config";

const Compare = () => {
  const [districts] = useState(["Imphal West", "Thoubal", "Churachandpur"]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const promises = districts.map(d =>
        fetch(`${API_BASE_URL}/api/district/${d}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      setData(results.map(r => r.data));
    };
    fetchAll();
  }, []);

  return (
    <div className="compare-container">
      <h2>Compare Districts</h2>
      <table>
        <thead>
          <tr>
            <th>District</th>
            <th>Wage Rate (₹)</th>
            <th>Households Worked</th>
            <th>Women Persondays</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.district_name}</td>
              <td>{d.metrics.Average_Wage_rate_per_day_per_person}</td>
              <td>{d.metrics.Total_Households_Worked}</td>
              <td>{d.metrics.Women_Persondays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Compare;
