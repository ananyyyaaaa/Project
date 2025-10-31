const express = require("express");
const router = express.Router();

router.get("/districts", getDistricts);

module.exports = router;