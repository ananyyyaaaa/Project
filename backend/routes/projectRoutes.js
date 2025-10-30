const express = require("express");
const router = express.Router();

const {
  updateDataFromAPI,
  getCachedData,
  getStatus
} = require("../controller/projectController.js");

// GET /api/mgnrega -> returns cached data for Manipur (query params: fin_year, district)
router.get("/", getCachedData);

// GET /api/mgnrega/update -> manual trigger to fetch from API and save (query param: fin_year)
router.get("/update", updateDataFromAPI);

// GET /api/mgnrega/status -> health + last update timestamp
router.get("/status", getStatus);

module.exports = router;
