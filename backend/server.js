require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const { fetchAllFromAPI, saveOrUpdateRecord } = require("./controller/projectController.js");

const app = express();
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
}
));
app.use(express.json());

// connect DB
connectDB(process.env.MONGO_URI);

// Basic root
app.get("/", (req, res) => res.send("✅ MGNREGA Manipur backend running"));

// routes
app.use("/api/mgnrega", projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Scheduled daily refresh
const cronExpr = process.env.CRON_SCHEDULE_DAILY_AT || "0 2 * * *"; // default: daily at 02:00 (server tz)
console.log("Cron schedule for daily update:", cronExpr);

// run at startup once (optional) — comment out if you don't want this
(async () => {
  try {
    console.log("Initial fetch attempt: fetching latest data from API (this may take a while)...");
    const fin_year = process.env.DEFAULT_FIN_YEAR || "2024-2025";
    const records = await fetchAllFromAPI({ state: "MANIPUR", fin_year, limit: Number(process.env.PAGE_LIMIT || 10) });
    if (records && records.length > 0) {
      for (const rec of records) {
        await saveOrUpdateRecord(rec);
      }
      console.log(`Initial fetch saved ${records.length} records for fin_year=${fin_year}`);
    } else {
      console.log("Initial fetch returned no records (API may not have data for requested fin_year)");
    }
  } catch (err) {
    console.error("Initial fetch failed:", err.message || err);
  }
})();

// schedule daily job
cron.schedule(cronExpr, async () => {
  try {
    console.log("Cron job: fetching latest MGNREGA data for Manipur...");
    const fin_year = process.env.DEFAULT_FIN_YEAR || "2024-2025";
    const records = await fetchAllFromAPI({ state: "MANIPUR", fin_year, limit: Number(process.env.PAGE_LIMIT || 10) });
    if (records && records.length > 0) {
      for (const rec of records) {
        await saveOrUpdateRecord(rec);
      }
      console.log(`Cron updated ${records.length} records for fin_year=${fin_year}`);
    } else {
      console.log("Cron fetch returned no records");
    }
  } catch (err) {
    console.error("Cron fetch failed:", err.message || err);
  }
});
