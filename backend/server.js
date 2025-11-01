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
const envOrigin = process.env.FRONTEND_URL;
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

// Helper: aggregate MGNREGA metrics from records
function aggregateMgnregaMetrics(records) {
	const normalizeNum = (v) => {
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	};

	if (records.length === 0) {
		return {
			totalActiveWorkers: 0,
			assetsCreated: 0,
			persondaysGenerated: 0,
			dbtTransactions: 0,
			householdsBenefitted: 0,
			individualCategoryWorks: 0,
			attendanceToday: 0,
			numberOfWorksites: 0,
			numberOfWorkers: 0,
		};
	}

	// Sort records by fin_year and month to get latest record
	const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const sortedRecords = [...records].sort((a, b) => {
		if (a.fin_year !== b.fin_year) {
			return (b.fin_year || '').localeCompare(a.fin_year || '');
		}
		const monthA = monthOrder.indexOf(a.month || '');
		const monthB = monthOrder.indexOf(b.month || '');
		return monthB - monthA;
	});
	
	// Use latest record (most recent month) for cumulative totals
	const latestRecord = sortedRecords[0];
	
	// Cumulative values - use latest record
	const totalActiveWorkers = normalizeNum(latestRecord.Total_No_of_Active_Workers);
	const householdsBenefitted = normalizeNum(latestRecord.Total_Households_Worked);
	const individualCategoryWorks = normalizeNum(latestRecord.Total_Individuals_Worked);
	const numberOfWorkers = normalizeNum(latestRecord.Total_No_of_Workers);
	
	// Sum persondays across all months (these are monthly counts)
	let persondaysGenerated = 0;
	let dbtTransactions = 0;
	
	// Track max for works (cumulative)
	let maxCompletedWorks = 0;
	let maxOngoingWorks = 0;
	
	for (const r of records) {
		persondaysGenerated += normalizeNum(r.Women_Persondays || 0);
		persondaysGenerated += normalizeNum(r.SC_persondays || 0);
		persondaysGenerated += normalizeNum(r.ST_persondays || 0);
		dbtTransactions += normalizeNum(r.Wages || r.Total_Exp || 0);
		
		// Track maximum for works (these might be cumulative)
		maxCompletedWorks = Math.max(maxCompletedWorks, normalizeNum(r.Number_of_Completed_Works));
		maxOngoingWorks = Math.max(maxOngoingWorks, normalizeNum(r.Number_of_Ongoing_Works));
	}
	
	const assetsCreated = maxCompletedWorks;
	const numberOfWorksites = maxCompletedWorks + maxOngoingWorks;
	
	// Attendance today: approximate using active workers (as real-time attendance not available)
	const attendanceToday = totalActiveWorkers;

	return {
		totalActiveWorkers,
		assetsCreated,
		persondaysGenerated: Math.round(persondaysGenerated),
		dbtTransactions: Math.round(dbtTransactions),
		householdsBenefitted,
		individualCategoryWorks,
		attendanceToday,
		numberOfWorksites,
		numberOfWorkers,
	};
}

// Route: fetch state-level data for Manipur
app.get("/api/mgnrega/manipur", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID;
		const apiKey = process.env.DATA_GOV_API_KEY;
		const rawFinYear = req.query.fin_year || process.env.FIN_YEAR || "2024-2025";
		const finYear = normalizeFinancialYear(rawFinYear);
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
		const metrics = aggregateMgnregaMetrics(records);

		return res.json({ data: metrics });
	} catch (err) {
		console.error("Error fetching Manipur data:", err.message);
		return res.status(500).json({ error: "Failed to fetch state data" });
	}
});

// Helper: normalize financial year format (handles both "2025-26" and "2025-2026")
function normalizeFinancialYear(year) {
	if (!year) return "2024-2025"; // Default
	// If format is "YYYY-YY", convert to "YYYY-YYYY"
	const match = year.match(/^(\d{4})-(\d{2,4})$/);
	if (match) {
		const startYear = parseInt(match[1]);
		const endPart = match[2];
		if (endPart.length === 2) {
			// Short format: "2025-26" -> "2025-2026"
			const endYear = 2000 + parseInt(endPart);
			return `${startYear}-${endYear}`;
		} else if (endPart.length === 4) {
			// Already full format: "2025-2026"
			return year;
		}
	}
	return year; // Return as-is if format is unexpected
}

// Route: fetch district-level data
app.get("/api/mgnrega/:district", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID;
		const apiKey = process.env.DATA_GOV_API_KEY;
		const rawFinYear = req.query.fin_year || process.env.FIN_YEAR || "2025-2026";
		const finYear = normalizeFinancialYear(rawFinYear);
		const district = String(req.params.district || "").toUpperCase();
		
		console.log(`[API] /api/mgnrega/:district - District: ${district}, Year: ${finYear} (raw: ${rawFinYear})`);
		
		if (!resourceId || !apiKey) {
			console.error("[API] DATA_GOV env not configured");
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
		
		console.log(`[API] Calling data.gov.in with params:`, JSON.stringify(params, null, 2));
		
		const { data } = await axios.get(url, { params });
		
		console.log(`[API] API response status: ${data?.status}, total: ${data?.total}, count: ${data?.count}`);
		
		let records = (data && data.records) || [];
		
		// If no records found with exact district name, try case-insensitive search
		if (records.length === 0 && data && data.records) {
			console.log(`[API] No exact match for "${district}", trying case-insensitive search...`);
			records = data.records.filter(r => {
				const recordDistrict = String(r.district_name || "").toUpperCase();
				return recordDistrict === district;
			});
			console.log(`[API] Found ${records.length} records after case-insensitive filter`);
		}
		
		// If still no records, check what districts are available for this year
		if (records.length === 0 && data && data.records && data.records.length > 0) {
			const availableDistricts = [...new Set(data.records.map(r => r.district_name).filter(Boolean))];
			console.log(`[API] Available districts for ${finYear}:`, availableDistricts.slice(0, 10));
			console.log(`[API] Looking for: "${district}"`);
		}
		
		console.log(`[API] Final records count: ${records.length} for ${district}`);
		
		if (records.length === 0) {
			console.warn(`[API] No records found for district: ${district}, fin_year: ${finYear}`);
		}
		
		const metrics = aggregateMgnregaMetrics(records);
		
		console.log(`[API] Aggregated metrics:`, JSON.stringify(metrics, null, 2));

		return res.json({ data: metrics, district });
	} catch (err) {
		console.error("Error fetching district data:", err.message);
		console.error("Error stack:", err.stack);
		return res.status(500).json({ error: "Failed to fetch district data: " + err.message });
	}
});

// Route: fetch districts for Manipur (returns { districts: string[] })
app.get("/api/districts", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID;
		const apiKey = process.env.DATA_GOV_API_KEY;
		const rawFinYear = req.query.fin_year || process.env.FIN_YEAR || "2024-2025";
		const finYear = normalizeFinancialYear(rawFinYear);
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
		const rawFinYear = req.query.fin_year || process.env.FIN_YEAR || "2025-2026";
		const finYear = normalizeFinancialYear(rawFinYear);
		const district = String(req.params.district || "").toUpperCase();
		
		console.log(`[API] /api/data/:district - District: ${district}, Year: ${finYear} (raw: ${rawFinYear})`);
		
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
		let records = (data && data.records) || [];
		
		// If no records found with exact district name, try case-insensitive search
		if (records.length === 0 && data && data.records) {
			console.log(`[API] No exact match for "${district}", trying case-insensitive search...`);
			records = data.records.filter(r => {
				const recordDistrict = String(r.district_name || "").toUpperCase();
				return recordDistrict === district;
			});
		}
		
		if (records.length === 0) {
			console.warn(`[API] No records found for district: ${district}, fin_year: ${finYear}`);
		}

		// The dataset returns multiple rows per district by month; use latest record for cumulative values
		const normalizeNum = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};
		
		// Get latest record (most recent month) for cumulative totals
		const latestRecord = records.length > 0 ? records[records.length - 1] : null;

		// Aggregate over all records for the district in the financial year
		// Use MAX for cumulative values, SUM for monthly metrics
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
		let hhCompleted100Days = 0;
		let jobCardsIssued = 0;
		let jobCardsActive = 0;

		// For cumulative values, track maximum across months
		let maxJobCardsIssued = 0;
		let maxJobCardsActive = 0;
		let maxHHCompleted100Days = 0;
		let maxTotalHouseholds = 0;
		let maxTotalIndividuals = 0;

		const trends = [];
		const monthlyWorksMap = new Map(); // Store monthly works data aggregated by month
		const monthlyWagesMap = new Map(); // Store monthly wages for trend chart
		
		for (const r of records) {
			// Sum monthly values
			const hh = normalizeNum(r.Total_Households_Worked);
			const individuals = normalizeNum(r.Total_Individuals_Worked);
			
			// Track max for cumulative values
			maxJobCardsIssued = Math.max(maxJobCardsIssued, normalizeNum(r.Total_No_of_JobCards_issued));
			maxJobCardsActive = Math.max(maxJobCardsActive, normalizeNum(r.Total_No_of_Active_Job_Cards));
			maxHHCompleted100Days = Math.max(maxHHCompleted100Days, normalizeNum(r.Total_No_of_HHs_completed_100_Days_of_Wage_Employment));
			maxTotalHouseholds = Math.max(maxTotalHouseholds, hh);
			maxTotalIndividuals = Math.max(maxTotalIndividuals, individuals);

			// Sum monthly employment data (these might be monthly snapshots)
			totalHouseholds += hh;
			totalIndividuals += individuals;

			if (r.Average_days_of_employment_provided_per_Household !== undefined && normalizeNum(r.Average_days_of_employment_provided_per_Household) > 0) {
				averageDaysSum += normalizeNum(r.Average_days_of_employment_provided_per_Household);
				averageDaysCount += 1;
			}
			if (r.Average_Wage_rate_per_day_per_person !== undefined && normalizeNum(r.Average_Wage_rate_per_day_per_person) > 0) {
				averageWageSum += normalizeNum(r.Average_Wage_rate_per_day_per_person);
				averageWageCount += 1;
			}
			totalWages += normalizeNum(r.Wages ?? r.Total_Exp);
			completedWorks += normalizeNum(r.Number_of_Completed_Works);
			ongoingWorks += normalizeNum(r.Number_of_Ongoing_Works);
			totalWorksTakenUp += normalizeNum(r.Total_No_of_Works_Takenup);
			if (r.percent_of_Category_B_Works !== undefined && normalizeNum(r.percent_of_Category_B_Works) > 0) {
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
			
			// Monthly data aggregation (works and wages)
			const month = r.month || '';
			if (month) {
				// Monthly wages for trend chart (in Lakhs)
				const monthlyWage = normalizeNum(r.Wages ?? r.Total_Exp ?? 0) / 100000; // Convert to Lakhs
				if (!monthlyWagesMap.has(month)) {
					monthlyWagesMap.set(month, monthlyWage);
				} else {
					// Sum wages for the same month (if multiple records)
					monthlyWagesMap.set(month, monthlyWagesMap.get(month) + monthlyWage);
				}
				
				// Monthly works data for trendline chart - aggregate by month using max (cumulative values)
				const monthlyCompleted = normalizeNum(r.Number_of_Completed_Works);
				const monthlyOngoing = normalizeNum(r.Number_of_Ongoing_Works);
				
				if (!monthlyWorksMap.has(month)) {
					monthlyWorksMap.set(month, {
						month,
						completedWorks: monthlyCompleted,
						ongoingWorks: monthlyOngoing
					});
				} else {
					// Use maximum value for cumulative metrics
					const existing = monthlyWorksMap.get(month);
					existing.completedWorks = Math.max(existing.completedWorks, monthlyCompleted);
					existing.ongoingWorks = Math.max(existing.ongoingWorks, monthlyOngoing);
				}
			}
		}
		
		// Convert map to array for monthly works trends
		const monthlyWorksData = Array.from(monthlyWorksMap.values());

		// Use latest record for cumulative values if available
		if (latestRecord) {
			jobCardsIssued = normalizeNum(latestRecord.Total_No_of_JobCards_issued) || maxJobCardsIssued;
			jobCardsActive = normalizeNum(latestRecord.Total_No_of_Active_Job_Cards) || maxJobCardsActive;
			hhCompleted100Days = normalizeNum(latestRecord.Total_No_of_HHs_completed_100_Days_of_Wage_Employment) || maxHHCompleted100Days;
			totalHouseholds = normalizeNum(latestRecord.Total_Households_Worked) || maxTotalHouseholds || totalHouseholds;
			totalIndividuals = normalizeNum(latestRecord.Total_Individuals_Worked) || maxTotalIndividuals || totalIndividuals;
		} else {
			// Fallback to max values if no records
			jobCardsIssued = maxJobCardsIssued;
			jobCardsActive = maxJobCardsActive;
			hhCompleted100Days = maxHHCompleted100Days;
			totalHouseholds = maxTotalHouseholds || totalHouseholds;
			totalIndividuals = maxTotalIndividuals || totalIndividuals;
		}
		
		// Sum persondays across all months (these are monthly counts)
		const totalPersondays = womenPersondays + scPersondays + stPersondays;

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
				hhCompleted100Days,
				jobCardsIssued,
				jobCardsActive,
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
			monthlyWorksTrends: monthlyWorksData, // Monthly works data for trendline
			monthlyWagesTrends: Array.from(monthlyWagesMap.entries()).map(([month, value]) => ({ month, wagesLakhs: Math.round(value * 100) / 100 })).sort((a, b) => {
				const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
				return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
			}), // Monthly wages in Lakhs, sorted by financial year order
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

// Route: fetch inclusion data for a district (monthly trends)
app.get("/api/inclusion/:district", async (req, res) => {
	try {
		const resourceId = process.env.DATA_GOV_DISTRICTS_RESOURCE_ID;
		const apiKey = process.env.DATA_GOV_API_KEY;
		const rawFinYear = req.query.fin_year || process.env.FIN_YEAR || "2024-2025";
		const finYear = normalizeFinancialYear(rawFinYear);
		const district = String(req.params.district || "").toUpperCase();
		
		console.log(`[API] /api/inclusion/:district - District: ${district}, Year: ${finYear}`);
		
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
		let records = (data && data.records) || [];
		
		// If no records found with exact district name, try case-insensitive search
		if (records.length === 0 && data && data.records) {
			records = data.records.filter(r => {
				const recordDistrict = String(r.district_name || "").toUpperCase();
				return recordDistrict === district;
			});
		}

		const normalizeNum = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};

		// Sort records by month order (April to March for financial year)
		const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
		const sortedRecords = [...records].sort((a, b) => {
			if (a.fin_year !== b.fin_year) {
				return (a.fin_year || '').localeCompare(b.fin_year || '');
			}
			const monthA = monthOrder.indexOf(a.month || '');
			const monthB = monthOrder.indexOf(b.month || '');
			return monthA - monthB;
		});

		// Build monthly trends data
		const monthlyTrends = sortedRecords.map(r => ({
			month: r.month || 'Unknown',
			women: normalizeNum(r.Women_Persondays || 0),
			sc: normalizeNum(r.SC_persondays || 0),
			st: normalizeNum(r.ST_persondays || 0),
			differentlyAbled: normalizeNum(r.Differently_abled_persons_worked || 0),
		}));

		// Calculate total yearly participation
		const totals = sortedRecords.reduce((acc, r) => {
			acc.women += normalizeNum(r.Women_Persondays || 0);
			acc.sc += normalizeNum(r.SC_persondays || 0);
			acc.st += normalizeNum(r.ST_persondays || 0);
			acc.differentlyAbled += normalizeNum(r.Differently_abled_persons_worked || 0);
			return acc;
		}, { women: 0, sc: 0, st: 0, differentlyAbled: 0 });

		return res.json({
			data: {
				monthlyTrends,
				totals,
				finYear,
				district,
			}
		});
	} catch (err) {
		console.error("Error fetching inclusion data:", err.message);
		return res.status(500).json({ error: "Failed to fetch inclusion data: " + err.message });
	}
});

app.get("/", (req, res) => {
	res.send("✅ MGNREGA Manipur backend running — districts endpoint ready");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

