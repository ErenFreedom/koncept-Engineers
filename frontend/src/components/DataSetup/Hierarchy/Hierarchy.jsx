import React, { useState } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";
import HierarchyTree from "./HierarchyTree";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useMemo } from "react";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";


import AddFloorForm from "../forms/AddFloorForm";
import AddRoomForm from "../forms/AddRoomForm";
import AddFloorAreaForm from "../forms/AddFloorAreaForm";
import AddRoomSegmentForm from "../forms/AddRoomSegmentForm";
import AddPieceOfEquipmentForm from "../forms/AddPieceOfEquipmentForm";
import RegisterSubSiteForm from "../forms/RegisterSubSiteForm";
import AddSubsiteFloorForm from "../forms/AddSubsiteFloorForm";
import AddSubsiteRoomForm from "../forms/AddSubsiteRoomForm";
import AddSubsiteFloorAreaForm from "../forms/AddSubsiteFloorAreaForm";
import AddSubsiteRoomSegmentForm from "../forms/AddSubsiteRoomSegmentForm";
import AddSubsitePoEForm from "../forms/AddSubsitePoEForm";
import MainSiteInfoForm from "../forms/MainSiteInfoForm";

const Hierarchy = () => {
  const { admin, accessToken } = useAuth();
  const dispatch = useDispatch();
  const { floors, rooms, floorAreas, roomSegments, poes, loading, error } = useSelector((state) => state.hierarchy);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchHierarchyData(null, accessToken));
    }
  }, [dispatch, accessToken]);


  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownAction, setDropdownAction] = useState(null);


  const toggleNode = (parent, index) => {
    const key = `${parent}-${index}`;
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNodeClick = (label, type) => {
    setSelectedNode({ label, type });
    setDropdownAction(null); // reset form
  };

  const handleDropdownSelect = (actionType) => {
    setDropdownAction(actionType);
    setShowDropdown(false);
  };

  const allowedForms = {
    "main-site": ["floor", "main-site-info"], // ✅ add here
    floor: ["room"],
    room: ["floor-area", "room-segment", "poe"],
    "floor-area": [],
    "room-segment": [],
    poe: [],
    subsite: ["subsite-floor"],
    "subsite-floor": ["subsite-room"],
    "subsite-room": ["subsite-floor-area", "subsite-room-segment", "subsite-poe"],
    "subsite-floor-area": [],
    "subsite-room-segment": [],
    "subsite-poe": [],
  };


  const labelMap = {
    floor: "Add Floor",
    room: "Add Room",
    "floor-area": "Add Floor Area",
    "room-segment": "Add Room Segment",
    poe: "Add Piece of Equipment",
    subsite: "Register Sub-site",
    "subsite-floor": "Add Subsite Floor",
    "subsite-room": "Add Subsite Room",
    "subsite-floor-area": "Add Subsite Floor Area",
    "subsite-room-segment": "Add Subsite Room Segment",
    "subsite-poe": "Add Subsite PoE",
    "main-site-info": "Edit Main Site Info",
  };


  const renderFormForAction = (actionType) => {
    switch (actionType) {
      case "floor":
        return <AddFloorForm />;
      case "room":
        return <AddRoomForm />;
      case "floor-area":
        return <AddFloorAreaForm />;
      case "room-segment":
        return <AddRoomSegmentForm />;
      case "poe":
        return <AddPieceOfEquipmentForm />;
      case "subsite":
        return <RegisterSubSiteForm />;
      case "subsite-floor":
        return <AddSubsiteFloorForm />;
      case "subsite-room":
        return <AddSubsiteRoomForm />;
      case "subsite-floor-area":
        return <AddSubsiteFloorAreaForm />;
      case "subsite-room-segment":
        return <AddSubsiteRoomSegmentForm />;
      case "subsite-poe":
        return <AddSubsitePoEForm />;
      case "main-site-info":
        return <MainSiteInfoForm />; // ✅ new case
      default:
        return <p className="no-selection">🛈 Select a node and action to view a form.</p>;
    }
  };


  const buildDynamicTree = () => {
    const siteNode = {
      site: `Main Site - ${admin?.companyName || "Company"}`,
      type: "main-site",
      children: [],
    };

    const floorNodes = floors.map((floor) => {
      const floorNode = {
        name: floor.name,
        type: "floor",
        children: [],
      };

      const roomNodes = rooms
        .filter((r) => r.floor_id === floor.id)
        .map((room) => {
          const roomNode = {
            name: room.name,
            type: "room",
            children: [],
          };

          const roomSegmentNodes = roomSegments
            .filter((seg) => seg.room_id === room.id)
            .map((seg) => ({
              name: seg.name,
              type: "room-segment",
            }));

          const roomPoEs = poes
            .filter((poe) => poe.location_type === "room" && poe.location_id === room.id)
            .map((poe) => ({
              name: poe.name,
              type: "poe",
            }));

          roomNode.children = [...roomSegmentNodes, ...roomPoEs];
          return roomNode;
        });

      const floorAreaNodes = floorAreas
        .filter((fa) => fa.floor_id === floor.id)
        .map((fa) => {
          const faPoEs = poes
            .filter((poe) => poe.location_type === "floor_area" && poe.location_id === fa.id)
            .map((poe) => ({
              name: poe.name,
              type: "poe",
            }));
          return {
            name: fa.name,
            type: "floor-area",
            children: faPoEs,
          };
        });

      const floorPoEs = poes
        .filter((poe) => poe.location_type === "floor" && poe.location_id === floor.id)
        .map((poe) => ({
          name: poe.name,
          type: "poe",
        }));

      floorNode.children = [...floorAreaNodes, ...roomNodes, ...floorPoEs];
      return floorNode;
    });

    const sitePoEs = poes
      .filter((poe) => poe.location_type === "site")
      .map((poe) => ({
        name: poe.name,
        type: "poe",
      }));

    siteNode.children = [...floorNodes, ...sitePoEs];
    return [siteNode];
  };

  const dynamicTree = useMemo(() => buildDynamicTree(), [floors, rooms, floorAreas, roomSegments, poes]);



  return (
    <div className="hierarchy-tab">
      {/* 🔍 Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search site, building, floor, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Main Layout */}
      <div className="hierarchy-container">
        {/* 🌳 Tree Panel */}
        <div className="tree-panel" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Hierarchy Tree</h3>
            <div className="three-dot-menu" onClick={() => setShowDropdown(!showDropdown)}>⋮</div>
          </div>

          <div className="tree-list">
            {loading && <p className="loading-text">Loading hierarchy...</p>}
            {error && floors.length === 0 && rooms.length === 0 && floorAreas.length === 0 && roomSegments.length === 0 && poes.length === 0 && (
              <p className="error-text">Error: {error}</p>
            )}


            <HierarchyTree
              treeData={dynamicTree}
              onSelect={handleNodeClick}
            />

          </div>

          {/* 🎯 Context Dropdown */}
          {showDropdown && selectedNode?.type && (
            <div className="context-dropdown">
              {(Object.keys(labelMap) || []).map((key) => (
                <button
                  key={key}
                  onClick={() => handleDropdownSelect(key)}
                  disabled={
                    !allowedForms[selectedNode.type] ||
                    !allowedForms[selectedNode.type].includes(key)
                  }
                >
                  {labelMap[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 📄 Form Panel */}
        <div className="form-panel">
          <div className="form-box">
            <h4>{selectedNode?.label || "Site Name"}</h4>
            {dropdownAction ? renderFormForAction(dropdownAction) : (
              <p className="no-selection">🛈 Use the ⋮ menu to select what to add</p>
            )}
          </div>

          <div className="form-box">
            <h4>Relationships</h4>
            <p>Relationships Form Placeholder</p>
          </div>

          <div className="form-box">
            <h4>Tags</h4>
            <p>Tags Form Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
