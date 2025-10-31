import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/Chart.css";
import { API_BASE_URL } from "../config";

const Chart = ({ district }) => {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchTrends = async () => {
      const res = await fetch(`${API_BASE_URL}/trends/${district}`);
      const json = await res.json();
      setTrendData(json.data || []);
    };
    fetchTrends();
  }, [district]);

  return (
    <div className="chart-card">
      <h3>Persondays & Wages Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="metrics.Wages" stroke="#2a7b45" name="Total Wages" />
          <Line type="monotone" dataKey="metrics.Total_Households_Worked" stroke="#8884d8" name="Households Worked" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
