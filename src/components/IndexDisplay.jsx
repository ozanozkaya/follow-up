import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./IndexDisplay.css"; // Ensure you have this CSS file in your project

function IndexDisplay() {
  const [data, setData] = useState([]);
  const [rfusData, setRfusData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Function to fetch data from your data source
  const fetchData = async () => {
    try {
      const response = await axios.get("../Imc.Json"); // Update the path to your data source
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

    // Applying filters sequentially
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        newData = newData.filter((item) => {
          if (filterKey === "ageRange") {
            const age = parseInt(item.age, 10);
            switch (filterValue) {
              case "0-4":
                return age >= 0 && age <= 4;
              case "5-17":
                return age >= 5 && age <= 17;
              case "18-49":
                return age >= 18 && age <= 49;
              case "50+":
                return age >= 50;
              default:
                return true;
            }
          } else {
            return item[filterKey] === filterValue;
          }
        });
      }
    });

    // Apply date range if present
    if (startDate && endDate) {
      newData = newData.filter((item) => {
        const itemDate = new Date(item.start);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Apply month filter if present
    if (selectedMonth) {
      newData = newData.filter((item) => {
        const itemDate = new Date(item.start);
        return itemDate.getMonth() === parseInt(selectedMonth, 10);
      });
    }

    // Apply search term if present
    if (searchTerm) {
      newData = newData.filter((item) =>
        Object.values(item).some(
          (val) =>
            typeof val === "string" &&
            val.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredData(newData);
  }, [
    data,
    rfusData,
    searchTerm,
    activeFilters,
    startDate,
    endDate,
    selectedMonth,
  ]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  // Function to render the active filters
  const renderActiveFilters = () => {
    return Object.entries(activeFilters).map(
      ([filterKey, filterValue], index) => (
        <span key={index} className="active-filter">
          {`${filterKey}: ${filterValue}`}
          <button onClick={() => removeFilter(filterKey)}>x</button>
        </span>
      )
    );
  };

  // Handler to set filters
  const applyFilter = (filterKey, filterValue) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: filterValue,
    }));
    setSearchTerm(""); // Clear search when new filter is applied
  };

  // Handler to remove a specific filter
  const removeFilter = (filterKey) => {
    setActiveFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  return (
    <div>
      <div className="filters">
        {/* Preset Filters */}
        <button onClick={() => applyFilter("Gender of Client", "Male")}>
          Male
        </button>
        <button onClick={() => applyFilter("Gender of Client", "Female")}>
          Female
        </button>
        <button onClick={() => applyFilter("Nationality of Client", "Syrian")}>
          Syrian
        </button>
        <button onClick={() => applyFilter("Nationality of Client", "Afghan")}>
          Afghan
        </button>
        <button onClick={() => applyFilter("Nationality of Client", "Turkish")}>
          Turkish
        </button>
        <button onClick={() => applyFilter("Nationality of Client", "Iraqi")}>
          Iraqi
        </button>
        <button onClick={() => applyFilter("Nationality of Client", "Other")}>
          Other
        </button>

        {/* Age Range Filters */}
        <button onClick={() => applyFilter("ageRange", "0-4")}>Age 0-4</button>
        <button onClick={() => applyFilter("ageRange", "5-17")}>
          Age 5-17
        </button>
        <button onClick={() => applyFilter("ageRange", "18-49")}>
          Age 18-49
        </button>
        <button onClick={() => applyFilter("ageRange", "50+")}>Age 50+</button>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Month Selection Dropdown */}
        <select
          className="select-month"
          value={selectedMonth}
          onChange={(e) => handleMonthSelect(e.target.value)}
        >
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

        {/* Date Range Picker */}
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable={true}
        />
      </div>

      <div className="active-filters-container">{renderActiveFilters()}</div>

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
            <p>Age: {item.age}</p>
            <p>Nationality: {item["Nationality of Client"]}</p>
            <p>Gender: {item["Gender of Client"]}</p>
            <p>District: {item["District of Hatay"] || "Not Available"}</p>
            <p>Service: {item.service || "Not Available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexDisplay;
