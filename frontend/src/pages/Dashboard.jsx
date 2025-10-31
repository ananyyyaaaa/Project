import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Metric from "../components/Metric";
import Chart from "../components/Chart";
import "../styles/Dashboard.css";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const { district } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/district/${district}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistrictData();
  }, [district]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available for {district}</p>;

  const m = data.metrics;

  return (
    <div className="dashboard-container">
      <h1>{district} – MGNREGA Performance</h1>
      <p>Financial Year: {data.fin_year} | Month: {data.month}</p>

      <section className="section">
        <h2>🏠 Employment Overview</h2>
        <div className="grid">
          <MetricCard title="Total Households Worked" value={m.Total_Households_Worked} icon="👨‍👩‍👧" />
          <MetricCard title="Avg Days of Employment" value={m.Average_days_of_employment_provided_per_Household} suffix=" days" />
          <MetricCard title="Total Job Cards Issued" value={m.Approved_Labour_Budget} />
        </div>
      </section>

      <section className="section">
        <h2>💰 Wages & Payment</h2>
        <div className="grid">
          <MetricCard title="Avg Wage Rate" value={m.Average_Wage_rate_per_day_per_person} prefix="₹" />
          <MetricCard title="Total Wages" value={m.Wages} prefix="₹" />
          <MetricCard title="Total Expenditure" value={m.Total_Exp} prefix="₹" />
        </div>
      </section>

      <section className="section">
        <h2>🧬 Inclusivity</h2>
        <div className="grid">
          <MetricCard title="Women Persondays" value={m.Women_Persondays} />
        </div>
      </section>

      <section className="section">
        <h2>📈 Trends</h2>
        <ChartCard district={district} />
      </section>
    </div>
  );
};

export default Dashboard;
