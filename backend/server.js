const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const defaultOrigins = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];
const envOrigin = process.env.ALLOWED_ORIGIN;
const allowedOrigins = envOrigin ? [envOrigin, ...defaultOrigins] : defaultOrigins;

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		return callback(new Error("Not allowed by CORS"));
	},
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	optionsSuccessStatus: 204,
}));

app.options("*", cors());

app.use(express.json());

const DATA_GOV_API_BASE = "https://api.data.gov.in/resource";

app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

// Route: fetch districts for Manipur (returns { districts: string[] })
app.get("/api/districts", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID;
		const apiKey = process.env.DATA_GOV_API_KEY;
		const finYear = req.query.fin_year || process.env.FIN_YEAR || "2025-2026";
		if (!resourceId || !apiKey) {
			return res.status(500).json({ error: "DATA_GOV env not configured" });
		}

		const url = `${DATA_GOV_API_BASE}/${resourceId}`;
		const params = {
			"api-key": apiKey,
			format: "json",
			limit: 2000,
			"filters[state_name]": "MANIPUR",
			"filters[fin_year]": finYear,
		};
		const { data } = await axios.get(url, { params });
		const records = (data && data.records) || [];
		const districts = Array.from(
			new Set(
				records
					.map((r) => r.district_name || r.district || r.districtname || r.district_cd || r.district_code)
					.filter(Boolean)
					.map((d) => String(d).toUpperCase().trim())
			)
		).sort();
		return res.json({ districts });
	} catch (err) {
		console.error("Error fetching districts:", err.message);
		return res.status(500).json({ error: "Failed to fetch districts" });
	}
});

// Route: fetch metrics for a district
app.get("/api/data/:district", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID; // same dataset used
		const apiKey = process.env.DATA_GOV_API_KEY;
		const finYear = req.query.fin_year || process.env.FIN_YEAR || "2025-2026";
		const district = String(req.params.district || "").toUpperCase();
		if (!resourceId || !apiKey) {
			return res.status(500).json({ error: "DATA_GOV env not configured" });
		}

		const url = `${DATA_GOV_API_BASE}/${resourceId}`;
		const params = {
			"api-key": apiKey,
			format: "json",
			limit: 2000,
			"filters[state_name]": "MANIPUR",
			"filters[fin_year]": finYear,
			"filters[district_name]": district,
		};
		const { data } = await axios.get(url, { params });
		const records = (data && data.records) || [];

		// The dataset returns multiple rows per district by month; we can aggregate or use the latest month.
		// We'll compute simple aggregates and build a trend over Total_Exp or Wages by month.
		const normalizeNum = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};

		// Aggregate over all records for the district in the financial year
		let totalHouseholds = 0;
		let totalIndividuals = 0;
		let averageDaysSum = 0;
		let averageDaysCount = 0;
		let averageWageSum = 0;
		let averageWageCount = 0;
		let totalWages = 0;
		let completedWorks = 0;
		let ongoingWorks = 0;
		let totalWorksTakenUp = 0;
		let percentCategoryBSum = 0;
		let percentCategoryBCount = 0;
		let womenPersondays = 0;
		let scPersondays = 0;
		let stPersondays = 0;

		const trends = [];
		for (const r of records) {
			totalHouseholds += normalizeNum(r.Total_Households_Worked);
			totalIndividuals += normalizeNum(r.Total_Individuals_Worked);

			if (r.Average_days_of_employment_provided_per_Household !== undefined) {
				averageDaysSum += normalizeNum(r.Average_days_of_employment_provided_per_Household);
				averageDaysCount += 1;
			}
			if (r.Average_Wage_rate_per_day_per_person !== undefined) {
				averageWageSum += normalizeNum(r.Average_Wage_rate_per_day_per_person);
				averageWageCount += 1;
			}
			totalWages += normalizeNum(r.Wages ?? r.Total_Exp);
			completedWorks += normalizeNum(r.Number_of_Completed_Works);
			ongoingWorks += normalizeNum(r.Number_of_Ongoing_Works);
			totalWorksTakenUp += normalizeNum(r.Total_No_of_Works_Takenup);
			if (r.percent_of_Category_B_Works !== undefined) {
				percentCategoryBSum += normalizeNum(r.percent_of_Category_B_Works);
				percentCategoryBCount += 1;
			}
			womenPersondays += normalizeNum(r.Women_Persondays);
			scPersondays += normalizeNum(r.SC_persondays);
			stPersondays += normalizeNum(r.ST_persondays);

			// trend line: use Total_Exp (fallback to Wages) per month
			const period = `${r.fin_year || finYear}-${r.month || ""}`.trim();
			const value = normalizeNum(r.Total_Exp ?? r.Wages ?? 0);
			if (period && value >= 0) trends.push({ period, value });
		}

		const averageDays = averageDaysCount ? Math.round((averageDaysSum / averageDaysCount) * 10) / 10 : 0;
		const averageWage = averageWageCount ? Math.round((averageWageSum / averageWageCount) * 10) / 10 : 0;
		const percentCategoryBWorks = percentCategoryBCount ? Math.round((percentCategoryBSum / percentCategoryBCount) * 10) / 10 : 0;

		const persondaysSum = womenPersondays + scPersondays + stPersondays;
		const womenParticipationPct = persondaysSum ? Math.round((womenPersondays / persondaysSum) * 1000) / 10 : 0;
		const scStParticipationPct = persondaysSum ? Math.round(((scPersondays + stPersondays) / persondaysSum) * 1000) / 10 : 0;

		const response = {
			employment: {
				totalHouseholds,
				totalIndividuals,
				averageDays,
			},
			wages: {
				averageWage,
				totalWages,
			},
			workProgress: {
				completedWorks,
				ongoingWorks,
				totalWorksTakenUp,
				percentCategoryBWorks,
			},
			inclusivity: {
				womenParticipationPct,
				scStParticipationPct,
			},
			trends,
			meta: {
				finYear,
				district,
				records: records.length,
			},
		};

		return res.json({ data: response });
	} catch (err) {
		console.error("Error fetching district data:", err.message);
		return res.status(500).json({ error: "Failed to fetch district data" });
	}
});

app.get("/", (req, res) => {
	res.send("✅ MGNREGA Manipur backend running — districts endpoint ready");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
