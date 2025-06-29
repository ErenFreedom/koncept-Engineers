import React, { useState, useRef } from "react";
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
  const { floors, rooms, floorAreas, roomSegments, poes, subsites, loading, error } = useSelector((state) => state.hierarchy);


  useEffect(() => {
    if (accessToken) {
      dispatch(fetchHierarchyData(null, accessToken));
    }
  }, [dispatch, accessToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        treePanelRef.current &&
        !treePanelRef.current.contains(event.target)
      ) {
        setDropdownNode(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [dropdownNode, setDropdownNode] = useState(null);
  const [dropdownAction, setDropdownAction] = useState(null);
  const treePanelRef = useRef(null);



  const toggleNode = (parent, index) => {
    const key = `${parent}-${index}`;
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNodeClick = (label, type, node) => {
    setSelectedNode({ label, type, ...node });
    setDropdownNode(null);
  };


  const handleDropdownSelect = (actionType) => {
    setDropdownAction(actionType);
    setDropdownNode(null);
  };


  const allowedForms = {
    "main-site": ["floor", "poe"],                  // In site: floors + PoEs
    floor: ["room", "floor-area", "poe"],           // Floor: rooms + floor areas + PoEs
    room: ["room-segment", "poe"],                  // Room: room segments + PoEs
    "floor-area": ["poe"],                          // Floor area: PoEs
    "room-segment": ["poe"],                        // Room segment: PoEs
    poe: ["data-point"],                           // PoEs: sensors
    subsite: ["subsite-floor"],                    // Subsite: subsite floors
    "subsite-floor": ["subsite-room"],             // Subsite floor: subsite rooms
    "subsite-room": ["subsite-floor-area", "subsite-room-segment", "subsite-poe"], // Subsite room
    "subsite-floor-area": [],                      // Subsite floor area: nothing more
    "subsite-room-segment": [],                    // Subsite room segment: nothing more
    "subsite-poe": [],                             // Subsite PoE: nothing more
  };



  const labelMap = {
    floor: "Add Floor",
    room: "Add Room",
    "floor-area": "Add Floor Area",
    "room-segment": "Add Room Segment",
    poe: "Add Piece of Equipment",
    "data-point": "Mount Data Point",
    subsite: "Register Sub-site",
    "subsite-floor": "Add Subsite Floor",
    "subsite-room": "Add Subsite Room",
    "subsite-floor-area": "Add Subsite Floor Area",
    "subsite-room-segment": "Add Subsite Room Segment",
    "subsite-poe": "Add Subsite PoE",
    "main-site-info": "Edit Main Site Info",
  };



  const renderFormForAction = (type, node) => {
    switch (type) {
      case "floor": return <AddFloorForm data={node} />;
      case "room": return <AddRoomForm data={node} />;
      case "floor-area": return <AddFloorAreaForm data={node} />;
      case "room-segment": return <AddRoomSegmentForm data={node} />;
      case "poe": return <AddPieceOfEquipmentForm data={node} />;
      case "data-point": return <div>Data Point Form Placeholder</div>;
      case "main-site": return <MainSiteInfoForm data={node} />;
      case "subsite": return <RegisterSubSiteForm data={node} />;
      case "subsite-floor": return <AddSubsiteFloorForm data={node} />;
      case "subsite-room": return <AddSubsiteRoomForm data={node} />;
      case "subsite-floor-area": return <AddSubsiteFloorAreaForm data={node} />;
      case "subsite-room-segment": return <AddSubsiteRoomSegmentForm data={node} />;
      case "subsite-poe": return <AddSubsitePoEForm data={node} />;
      default: return <p className="no-selection">🛈 No form available for this node</p>;
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

    const subsiteNodes = subsites.map((sub) => ({
      name: `Sub-site - ${sub.subSiteName}`,
      type: "subsite",
      children: [],
      ...sub, 
    }));

    return [siteNode, ...subsiteNodes];
  };


  const dynamicTree = useMemo(() => buildDynamicTree(), [floors, rooms, floorAreas, roomSegments, poes, subsites]);




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
        <div className="tree-panel" ref={treePanelRef} style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Hierarchy Tree</h3>
            <div
              className="three-dot-menu"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownNode(selectedNode);
              }}
            >
              ⋮
            </div>

          </div>

          <div className="tree-list">
            {loading && <p className="loading-text">Loading hierarchy...</p>}
            {error && floors.length === 0 && rooms.length === 0 && floorAreas.length === 0 && roomSegments.length === 0 && poes.length === 0 && (
              <p className="error-text">Error: {error}</p>
            )}


            <HierarchyTree
              treeData={dynamicTree}
              onSelect={handleNodeClick}
              setDropdownNode={setDropdownNode}
            />


          </div>

          {/* 🎯 Context Dropdown */}
          {dropdownNode && (
            <div className="context-dropdown">
              {(Object.keys(labelMap) || []).map((key) => (
                <button
                  key={key}
                  onClick={() => handleDropdownSelect(key)}
                  disabled={
                    !allowedForms[dropdownNode.type] ||
                    !allowedForms[dropdownNode.type].includes(key)
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
            <h4>{selectedNode?.label || "Select a Node"}</h4>
            {selectedNode ? renderFormForAction(selectedNode.type, selectedNode) : (
              <p className="no-selection">🛈 Select a node to view its details</p>
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
