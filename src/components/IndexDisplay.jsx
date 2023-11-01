import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./IndexDisplay.css"; // Import the CSS file

function IndexDisplay() {
  const [data, setData] = useState([]);
  const [rfusData, setRfusData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState("");

  const applyPresetFilter = (preset) => {
    setSearch(preset);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("../Imc.Json");
      setData(response.data["IMC Hatay Rehabilitation Ass..."]);
      setRfusData(response.data["RFuS"]);
    } catch (error) {
      console.error("Error fetching the JSON data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let newData = data.map((item) => {
      const rfusItem = rfusData.find((r) => r._index === item._index);
      return {
        ...item,
        service: rfusItem ? rfusItem["Who did get the service?"] : null,
      };
    });

    if (month) {
      newData = newData.filter(
        (item) => new Date(item.start).getMonth() === parseInt(month)
      );
    }

    if (startDate || endDate) {
      newData = newData.filter((item) => {
        const itemDate = new Date(item.start);
        return (
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      });
    }

    if (search) {
      newData = newData.filter(
        (item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
          ) ||
          (item.service &&
            item.service.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredData(newData);
  }, [month, search, startDate, endDate, data, rfusData]);

  return (
    <div>
      <div className="filters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          <option value="0">January</option>
          <option value="1">February</option>
          <option value="2">March</option>
          <option value="3">April</option>
          <option value="4">May</option>
          <option value="5">June</option>
          <option value="6">July</option>
          <option value="7">August</option>
          <option value="8">September</option>
          <option value="9">October</option>
          <option value="10">November</option>
          <option value="11">December</option>
        </select>

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
        />

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="preset-button"
          onClick={() => applyPresetFilter("Altınözü")}
        >
          Altınözü
        </button>
        <button
          className="preset-button"
          onClick={() => applyPresetFilter("Yayladağı")}
        >
          Yayladağı
        </button>
      </div>
      <div className="results-summary">
        <p>Displaying {filteredData.length} results</p>
      </div>

      <div className="flex-container">
        {filteredData.map((item, index) => (
          <div className="card" key={index}>
            <h3>Client: {item["Name of Client"]}</h3>
            <p>
              Individual Reference Code: {item["Individual Reference Code"]}
            </p>
            <p>Location of the Activity: {item["Location of the Activity"]}</p>
            <p>Date: {new Date(item.start).toLocaleDateString()}</p>
            <p>District: {item["District of Hatay"] || "Not Available"}</p>
            <p>Service: {item.service || "Not Available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexDisplay;
