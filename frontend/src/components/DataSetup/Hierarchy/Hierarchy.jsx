import React, { useState, useRef } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";
import HierarchyTree from "./HierarchyTree";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useMemo } from "react";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import { deleteEntity } from "../../../redux/actions/siteActions";
import { deleteSubSite } from "../../../redux/actions/subsiteActions";
import { deleteSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";




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
  const [activeForm, setActiveForm] = useState(null);

  const dispatch = useDispatch();
  const {
    floors = [],
    rooms = [],
    floorAreas = [],
    roomSegments = [],
    poes = [],
    subsites = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.hierarchy || {});



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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState(null);




  const toggleNode = (parent, index) => {
    const key = `${parent}-${index}`;
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteNode = (node) => {
    setNodeToDelete(node);
    setShowDeleteModal(true);
  };


  const handleNodeClick = (label, type, node) => {
    setSelectedNode({ label, type, ...node });
    setDropdownNode(null);
    setActiveForm(null);
  };



  const handleDropdownSelect = (actionType) => {
    console.log("🪵 Dropdown node on select:", dropdownNode);
    setActiveForm({ actionType, parentNode: dropdownNode });
    setDropdownAction(null);
    setDropdownNode(null);
  };

  const handleEditNode = (node) => {
    console.log("Editing node:", node);
    setSelectedNode({ ...node, isEditing: true });
    setActiveForm({ actionType: node.type, parentNode: { ...node, isEditing: true } });
  };






  const allowedForms = {
    "main-site": ["floor", "poe"],
    floor: ["room", "floor-area", "poe"],
    room: ["room-segment", "poe"],
    "floor-area": ["poe"],
    "room-segment": ["poe"],
    poe: ["data-point"],
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
    const commonProps = { data: node, setDropdownAction };

    switch (type) {
      case "floor": return <AddFloorForm {...commonProps} />;
      case "room": return <AddRoomForm {...commonProps} />;
      case "floor-area": return <AddFloorAreaForm {...commonProps} />;
      case "room-segment": return <AddRoomSegmentForm {...commonProps} />;
      case "poe": return <AddPieceOfEquipmentForm {...commonProps} />;
      case "data-point": return <div>Data Point Form Placeholder</div>;
      case "main-site": return <MainSiteInfoForm {...commonProps} />;
      case "subsite": return <RegisterSubSiteForm {...commonProps} />;
      case "subsite-floor": return <AddSubsiteFloorForm {...commonProps} />;
      case "subsite-room": return <AddSubsiteRoomForm {...commonProps} />;
      case "subsite-floor-area": return <AddSubsiteFloorAreaForm {...commonProps} />;
      case "subsite-room-segment": return <AddSubsiteRoomSegmentForm {...commonProps} />;
      case "subsite-poe": return <AddSubsitePoEForm {...commonProps} />;
      default: return <p className="no-selection">🛈 No form available for this node</p>;
    }
  };




  const buildDynamicTree = () => {
    const siteNode = {
      id: admin?.companyId,
      site: `Main Site - ${admin?.companyName || "Company"}`,
      type: "main-site",
      children: [],
    };

    const floorNodes = floors.map((floor) => {
      const floorNode = {
        id: floor.id,
        name: floor.name,
        type: "floor",
        site_id: admin?.companyId,
        children: [],
      };

      const floorAreaNodes = floorAreas
        .filter((fa) => fa.floor_id === floor.id)
        .map((fa) => {
          const faPoEs = poes
            .filter((poe) => poe.location_type === "floor_area" && poe.location_id === fa.id)
            .map((poe) => ({
              id: poe.id,
              name: poe.name,
              type: "poe",
              location_type: poe.location_type,
              location_id: poe.location_id,
            }));
          return {
            id: fa.id,
            name: fa.name,
            type: "floor-area",
            floor_id: fa.floor_id,
            children: faPoEs,
          };
        });

      const roomNodes = rooms
        .filter((r) => r.floor_id === floor.id)
        .map((room) => {
          const roomSegmentNodes = roomSegments
            .filter((seg) => seg.room_id === room.id)
            .map((seg) => ({
              id: seg.id,
              name: seg.name,
              type: "room-segment",
              room_id: seg.room_id,
            }));

          const roomPoEs = poes
            .filter((poe) => poe.location_type === "room" && poe.location_id === room.id)
            .map((poe) => ({
              id: poe.id,
              name: poe.name,
              type: "poe",
              location_type: poe.location_type,
              location_id: poe.location_id,
            }));

          return {
            id: room.id,
            name: room.name,
            type: "room",
            floor_id: room.floor_id,
            children: [...roomSegmentNodes, ...roomPoEs],
          };
        });

      const floorPoEs = poes
        .filter((poe) => poe.location_type === "floor" && poe.location_id === floor.id)
        .map((poe) => ({
          id: poe.id,
          name: poe.name,
          type: "poe",
          location_type: poe.location_type,
          location_id: poe.location_id,
        }));

      floorNode.children = [...floorAreaNodes, ...roomNodes, ...floorPoEs];
      return floorNode;
    });

    const sitePoEs = poes
      .filter((poe) => poe.location_type === "site")
      .map((poe) => ({
        id: poe.id,
        name: poe.name,
        type: "poe",
        location_type: poe.location_type,
        location_id: poe.location_id,
      }));

    siteNode.children = [...floorNodes, ...sitePoEs];

    const subsiteNodes = subsites.map((sub) => {
      const subsiteFloorNodes = sub.subsiteFloors?.map((floor) => {
        const floorNode = {
          id: floor.id,
          name: floor.name,
          type: "subsite-floor",
          subsite_id: sub.subsite_id,
          children: [],
        };

        const floorAreaNodes = floor.floorAreas?.map((fa) => {
          const faPoEs = fa.poes?.map((poe) => ({
            id: poe.id,
            name: poe.name,
            type: "subsite-poe",
            location_type: poe.location_type,
            location_id: poe.location_id,
            subsite_id: sub.subsite_id,
          })) || [];
          return {
            id: fa.id,
            name: fa.name,
            type: "subsite-floor-area",
            floor_id: fa.floor_id,
            subsite_id: sub.subsite_id,
            children: faPoEs,
          };
        }) || [];

        const floorRoomNodes = floor.rooms?.map((room) => {
          const roomSegmentNodes = room.roomSegments?.map((seg) => ({
            id: seg.id,
            name: seg.name,
            type: "subsite-room-segment",
            room_id: seg.room_id,
            subsite_id: sub.subsite_id,
          })) || [];

          const roomPoEs = room.poes?.map((poe) => ({
            id: poe.id,
            name: poe.name,
            type: "subsite-poe",
            location_type: poe.location_type,
            location_id: poe.location_id,
            subsite_id: sub.subsite_id,
          })) || [];

          return {
            id: room.id,
            name: room.name,
            type: "subsite-room",
            floor_id: room.floor_id,
            subsite_id: sub.subsite_id,
            children: [...roomSegmentNodes, ...roomPoEs],
          };
        }) || [];

        const floorPoEs = floor.poes?.map((poe) => ({
          id: poe.id,
          name: poe.name,
          type: "subsite-poe",
          location_type: poe.location_type,
          location_id: poe.location_id,
          subsite_id: sub.subsite_id,
        })) || [];

        floorNode.children = [...floorAreaNodes, ...floorRoomNodes, ...floorPoEs];
        return floorNode;
      }) || [];

      return {
        id: sub.subSiteId || sub.subsite_id,
        name: `Sub-site - ${sub.subSiteName}`,
        type: "subsite",
        subsite_id: sub.subSiteId || sub.subsite_id,
        children: subsiteFloorNodes,
        ...sub,
      };

    });


    return [siteNode, ...subsiteNodes];
  };




  const dynamicTree = useMemo(() => buildDynamicTree(), [floors, rooms, floorAreas, roomSegments, poes, subsites]);




  return (
    <div className="hierarchy-tab">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search site, building, floor, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="hierarchy-container">
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
              onEdit={handleEditNode}
              onDelete={handleDeleteNode}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />



          </div>

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

        <div className="form-panel">
          <div className="form-box">
            <h4>
              {dropdownAction
                ? labelMap[dropdownAction]
                : selectedNode?.label || "Select a Node"}
            </h4>

            {activeForm ? (
              renderFormForAction(activeForm.actionType, activeForm.parentNode)
            ) : selectedNode ? (
              renderFormForAction(selectedNode.type, selectedNode)
            ) : (
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Are you sure you want to delete <span style={{ color: "#f66" }}>{nodeToDelete?.name}</span>?</h4>
            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={async () => {
                  if (["floor", "room", "floor-area", "room-segment", "poe"].includes(nodeToDelete.type)) {
                    await dispatch(deleteEntity(nodeToDelete.type, nodeToDelete.id, accessToken));
                  } else if (nodeToDelete.type === "subsite") {
                    await dispatch(deleteSubSite({ subsite_id: nodeToDelete.subsite_id }, accessToken));
                  } else if (nodeToDelete.type.startsWith("subsite-")) {
                    const endpoint = `${nodeToDelete.type.replace("subsite-", "")}/delete`;
                    await dispatch(deleteSubsiteEntity(endpoint, { id: nodeToDelete.id, subsite_id: nodeToDelete.subsite_id }, accessToken));
                  }
                  dispatch(fetchHierarchyData(null, accessToken));
                  setShowDeleteModal(false);
                  setNodeToDelete(null);
                }}
              >Yes, Delete</button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setNodeToDelete(null);
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



export default Hierarchy;
