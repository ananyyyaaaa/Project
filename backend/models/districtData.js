const mongoose = require("mongoose");

const districtDataSchema = new mongoose.Schema({
  fin_year: { type: String, required: true },
  month: { type: String, default: "" },
  state_code: { type: String, default: "" },
  state_name: { type: String, required: true },
  district_code: { type: String, default: "" },
  district_name: { type: String, required: true },

  // Raw API payload (kept for reference/mapping future metrics)
  raw: { type: Object, default: {} },

  // Parsed metrics subset used by the controller today
  metrics: {
    type: new mongoose.Schema(
      {
        Approved_Labour_Budget: { type: Number, default: 0 },
        Average_Wage_rate_per_day_per_person: { type: Number, default: 0 },
        Average_days_of_employment_provided_per_Household: { type: Number, default: 0 },
        Total_Households_Worked: { type: Number, default: 0 },
        Total_Exp: { type: Number, default: 0 },
        Wages: { type: Number, default: 0 },
        Women_Persondays: { type: Number, default: 0 },
      },
      { _id: false }
    ),
    default: {},
  },

  last_updated: { type: Date, default: Date.now },
});

// Prevent duplicates by logical key
districtDataSchema.index(
  { state_name: 1, district_name: 1, fin_year: 1, month: 1 },
  { unique: false }
);

module.exports = mongoose.model("DistrictData", districtDataSchema);
