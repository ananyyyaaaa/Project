import React, { useEffect, useState } from "react";
import "../styles/EmploymentOverview.css";
import { API_BASE_URL } from "../config";

const EmploymentOverview = ({ district = "Imphal East" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmploymentData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/district/${district}`);
        const json = await res.json();
        setData(json.data || {});
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmploymentData();
  }, [district]);

  if (loading) return <p>Loading Employment Overview...</p>;
  if (!data?.metrics) return <p>No data available for {district}</p>;

  const m = data.metrics;

  return (
    <div className="employment-overview">
      {/* 🏠 Header */}
      <header className="header">
        <h2>🏠 रोजगार सारांश / Employment Overview</h2>
        <p>{district}, Manipur</p>
      </header>

      {/* 🌟 Main Grid */}
      <div className="metrics-grid">
        {/* 👨‍👩‍👧 Total Households Worked */}
        <div className="metric-card households">
          <h3>👨‍👩‍👧 Total Households Worked</h3>
          <p className="big-number">{m.Total_Households_Worked?.toLocaleString()}</p>
          <small>{m.Total_Individuals_Worked?.toLocaleString() || "—"} people</small>
        </div>

        {/* 📅 Avg. Days of Employment */}
        <div className="metric-card days">
          <h3>📅 Avg. Days of Employment</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(m.Average_days_of_employment_provided_per_Household / 100) * 100}%` }}
            ></div>
          </div>
          <p className="days-text">{m.Average_days_of_employment_provided_per_Household} Days</p>
        </div>

        {/* 🏆 100 Days Achieved */}
        <div className="metric-card achievement">
          <h3>🏆 100 Days Achieved</h3>
          <p className="highlight">🏆 {m.Total_HHs_Completed_100_Days || "—"} Families</p>
        </div>

        {/* 🪪 Job Cards Issued */}
        <div className="metric-card jobcards">
          <h3>🪪 Job Cards Issued</h3>
          <div className="pie">
            <div className="inner-circle"></div>
          </div>
          <p>{m.Total_Job_Cards_Issued?.toLocaleString() || "—"}</p>
        </div>

        {/* 💰 Wage Rate */}
        <div className="metric-card wage">
          <h3>💰 Avg. Wage Rate</h3>
          <p className="big-number">₹ {m.Average_Wage_rate_per_day_per_person?.toFixed(2)}</p>
        </div>

        {/* ⚙️ Last Updated */}
        <div className="metric-card updated">
          <h3>⚙️ Data Last Updated</h3>
          <p>{new Date(data.last_updated).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EmploymentOverview;
