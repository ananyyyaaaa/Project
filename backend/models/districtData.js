const mongoose = require("mongoose");

const districtDataSchema = new mongoose.Schema({
  state_name: String,
  district_name: String,
  district_code: String,
  fin_year: String,
  month: String,
  raw: Object, // stores complete API record
  metrics: {
    Approved_Labour_Budget: Number,
    Average_Wage_rate_per_day_per_person: Number,
    Average_days_of_employment_provided_per_Household: Number,
    Total_Households_Worked: Number,
    Total_Exp: Number,
    Wages: Number,
    Women_Persondays: Number,
  },
  last_updated: Date,
});

module.exports = mongoose.model("DistrictData", districtDataSchema);
