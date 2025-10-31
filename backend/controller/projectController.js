const fetch = require("node-fetch");

exports.getDistricts = async (req, res) => {
  try {
    const { API_KEY, BASE_URL } = process.env;

    const apiUrl = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=100`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.records) {
      return res.status(404).json({ message: "No records found from API" });
    }

    // Extract and sort unique district names
    const districts = [...new Set(data.records.map(r => r.district_name))].sort();

    res.json({ districts });
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
};
