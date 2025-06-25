import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import "./Tables.css";

const Table = () => {
  const [search, setSearch] = useState("");

  const data = [
    { name: "Building -A", id: "7c035368-...", level: 0, location: "Galgotias" },
    { name: "Building-B", id: "d3969a7e-...", level: 1, location: "Galgotias" },
    { name: "Second", id: "a1fc20c7-...", level: 2, location: "Galgotias" },
    { name: "Seventh Floor", id: "3f11a7e2-...", level: 7, location: "Galgotias" },
  ];

  return (
    <div className="table-wrapper">
      {/* Top bar with section title and action buttons */}
      <div className="table-header-bar">
        <h2>Tables</h2>
        <div className="right-buttons">
          <button className="top-btn create">+ Create</button>
          <button className="top-btn edit"><FaEdit /> Edit</button>
          <button className="top-btn delete"><FaTrash /> Delete</button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="table-toolbar">
        <div className="table-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-actions">
          <button className="filter-btn">Floors <FaChevronDown /></button>
          <button className="column-settings-btn">Column settings</button>
        </div>
      </div>

      {/* Table */}
      <table className="styled-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Name</th>
            <th>ID</th>
            <th>Floor level</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
            .map((item, index) => (
              <tr key={index}>
                <td><input type="checkbox" /></td>
                <td>{item.name}</td>
                <td>{item.id}</td>
                <td>{item.level}</td>
                <td>{item.location}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Placeholder */}
      <div className="form-placeholder">
        <h4>Form Placeholder</h4>
        <p>This form will change dynamically based on selected entity type.</p>
      </div>
    </div>
  );
};

export default Table;
