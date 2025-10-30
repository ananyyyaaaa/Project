/**
 * Controller: fetches data from data.gov.in, saves to MongoDB, serves data.
 * - fetchAllFromAPI: performs paginated fetch until no records returned
 * - saveOrUpdateRecord: upserts each record into DistrictData
 * - getCachedData: returns cached data for state=Manipur (optionally filter by fin_year)
 */

const axios = require("axios");
const DistrictData = require("../models/districtData");

const BASE_URL = process.env.BASE_URL || "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const API_KEY = process.env.API_KEY;
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT || 10);
const DEFAULT_FIN_YEAR = process.env.DEFAULT_FIN_YEAR || "2024-2025";

/**
 * Convert numeric-like fields from API record to numbers where possible
 */
function parseMetrics(record) {
  const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return undefined;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    Approved_Labour_Budget: toNumber(record.Approved_Labour_Budget),
    Average_Wage_rate_per_day_per_person: toNumber(record.Average_Wage_rate_per_day_per_person),
    Average_days_of_employment_provided_per_Household: toNumber(record.Average_days_of_employment_provided_per_Household),
    Total_Households_Worked: toNumber(record.Total_Households_Worked),
    Total_Exp: toNumber(record.Total_Exp),
    Wages: toNumber(record.Wages),
    Women_Persondays: toNumber(record.Women_Persondays),
  };
}

/**
 * Upsert a single API record into MongoDB
 */
async function saveOrUpdateRecord(rec) {
  // Normalize state_name to uppercase for consistency with API
  const stateName = (rec.state_name || "MANIPUR").toUpperCase();
  
  const query = {
    state_name: stateName,
    district_name: rec.district_name || rec.District_Name || "",
    fin_year: rec.fin_year || rec["fin year"] || "",
  };

  if (rec.month) query.month = rec.month; // optional month

  const update = {
    $set: {
      state_name: stateName,
      district_name: rec.district_name || rec.District_Name || "",
      district_code: rec.district_code || rec.District_Code || "",
      fin_year: rec.fin_year || rec["fin year"] || "",
      month: rec.month || rec.Month || "",
      raw: rec,
      metrics: parseMetrics(rec),
      last_updated: new Date(),
    },
  };

  await DistrictData.findOneAndUpdate(query, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).exec();
}

/**
 * Fetch paginated results from data.gov.in for Manipur and specified fin_year.
 */
async function fetchAllFromAPI({ state = "MANIPUR", fin_year = DEFAULT_FIN_YEAR, limit = PAGE_LIMIT } = {}) {
  const results = [];
  let offset = 0;
  let loopCount = 0;
  const maxLoops = 50; // safe limit to prevent infinite looping

  while (loopCount < maxLoops) {
    loopCount++;
    try {
      const resp = await axios.get(BASE_URL, {
        params: {
          "api-key": API_KEY,
          format: "json",
          "filters[state_name]": state,
          "filters[fin_year]": fin_year,
          limit,
          offset,
        },
        timeout: 20000,
      });

      const records = (resp.data && resp.data.records) ? resp.data.records : [];
      if (!records || records.length === 0) break;

      results.push(...records);
      if (records.length < limit) break;
      offset += limit;
    } catch (err) {
      throw new Error("API fetch failed: " + (err.message || err));
    }
  }

  return results;
}

/**
 * Controller: fetch data from API & save to DB
 */
async function updateDataFromAPI(req, res) {
  const fin_year = req.query.fin_year || DEFAULT_FIN_YEAR;
  try {
    const records = await fetchAllFromAPI({ state: "MANIPUR", fin_year, limit: PAGE_LIMIT });
    if (!records || records.length === 0) {
      return res.status(200).json({ message: "No records returned from API", count: 0 });
    }

    for (const rec of records) await saveOrUpdateRecord(rec);
    return res.json({ message: "Data updated successfully", count: records.length, fin_year });
  } catch (err) {
    console.error("updateDataFromAPI error:", err);
    return res.status(500).json({ message: "Failed to update data", error: String(err) });
  }
}

/**
 * Controller: get cached data from MongoDB
 */
async function getCachedData(req, res) {
  const fin_year = req.query.fin_year || DEFAULT_FIN_YEAR;
  const district = req.query.district;
  try {
    const query = { state_name: "MANIPUR", fin_year };
    if (district) query.district_name = new RegExp(`^${district}$`, "i");

    const records = await DistrictData.find(query).sort({ district_name: 1 }).lean().exec();
    const lastUpdatedDoc = await DistrictData.findOne({ state_name: "MANIPUR", fin_year })
      .sort({ last_updated: -1 })
      .lean()
      .exec();
    const last_updated = lastUpdatedDoc ? lastUpdatedDoc.last_updated : null;

    res.json({ last_updated, count: records.length, records });
  } catch (err) {
    console.error("getCachedData error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}

/**
 * Controller: health check
 */
async function getStatus(req, res) {
  try {
    const lastUpdatedDoc = await DistrictData.findOne({ state_name: "MANIPUR" })
      .sort({ last_updated: -1 })
      .lean()
      .exec();
    const last_updated = lastUpdatedDoc ? lastUpdatedDoc.last_updated : null;
    res.json({ status: "ok", last_updated });
  } catch (err) {
    res.status(500).json({ status: "error", error: String(err) });
  }
}

module.exports = {
  updateDataFromAPI,
  getCachedData,
  getStatus,
  fetchAllFromAPI,
  saveOrUpdateRecord,
};
