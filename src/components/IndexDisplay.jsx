import React, { useEffect, useState } from "react";
import axios from "axios";
import "./IndexDisplay.css"; // Import the CSS file

function IndexDisplay() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.get("../Imc.Json");
      const sectionData = response.data["IMC Hatay Rehabilitation Ass..."];
      if (Array.isArray(sectionData)) {
        setData(sectionData);
      } else {
        console.error("Specific section data is not an array:", sectionData);
      }
    } catch (error) {
      console.error("Error fetching the JSON data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let newData = data;

    if (month) {
      newData = newData.filter(
        (item) => new Date(item.start).getMonth() === parseInt(month)
      );
    }

    if (search) {
      newData = newData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    setFilteredData(newData);
  }, [month, search, data]);

  return (
    <div>
      <div className="filters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          <option value="8">September</option>
          <option value="9">October</option>
          {/* Add more months as options here */}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="results-summary">
        <p>Displaying {filteredData.length} results</p>
      </div>

      <div className="flex-container">
        {filteredData.map((item, index) => (
          <div className="card" key={index}>
            <h3>Client: {item["Name of Client"]}</h3>
            <p>
              Individual Reference Code: {item["Individual Referrence Code"]}
            </p>
            <p>Location of the Activity: {item["Location of the Activity"]}</p>
            <p>Date: {new Date(item.start).toLocaleDateString()}</p>
            <p>District: {item["District of Hatay"] || "Not Available"}</p>
            {/* Add any additional information you'd like to display */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexDisplay;
