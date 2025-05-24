import React, { useState, useEffect } from "react";
import { getFloors, addFloor } from "../../api/floor";
import { addRoom } from "../../api/room";
import { useAuth } from "../../context/AuthContext";
import ModalInput from "../ModalInput/ModalInput";
import "./HierarchySidebar.css";

const HierarchySidebar = ({ onSiteSelect, onFloorExpand }) => {
  const { admin } = useAuth();

  const [expandedSite, setExpandedSite] = useState(null);
  const [expandedFloor, setExpandedFloor] = useState({});
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState(null);

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) return;
    const fetchFloors = async () => {
      try {
        setLoading(true);
        const fetched = await getFloors(token);
        setFloors(fetched || []);
      } catch (err) {
        console.error("Failed to load floors:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, [token]);

  const toggleSite = (siteId) => {
    const isExpanding = expandedSite !== siteId;
    setExpandedSite(isExpanding ? siteId : null);
    if (onSiteSelect) onSiteSelect(isExpanding ? siteId : null);
  };

  const toggleFloor = (floorId) => {
    const key = `1-${floorId}`;
    const isExpanding = !expandedFloor[key];
    setExpandedFloor((prev) => ({ ...prev, [key]: isExpanding }));

    if (isExpanding) {
      setActiveFloorId(floorId);
      if (onFloorExpand) onFloorExpand(floorId);
    } else {
      setActiveFloorId(null);
    }
  };

  const handleFloorSubmit = async (name) => {
    try {
      await addFloor(name, token);
      const updated = await getFloors(token);
      setFloors(updated || []);
    } catch (err) {
      alert("❌ Failed to add floor");
    }
  };

  const handleRoomSubmit = async (name) => {
    if (!activeFloorId) return;
    try {
      await addRoom(activeFloorId, name, token);
      alert(`Room "${name}" added to Floor ${activeFloorId}`);
    } catch (err) {
      alert("❌ Failed to add room");
    }
  };

  return (
    <div className="hierarchy-sidebar">
      <h3 className="sidebar-heading">Building</h3>

      <div className="site-block">
        <div className="site-name" onClick={() => toggleSite(1)}>
          ▸ {admin?.companyName || "Your Site"}
          <button
            className="add-btn"
            title="Add Floor"
            onClick={(e) => {
              e.stopPropagation();
              setShowFloorModal(true);
            }}
          >
            ＋
          </button>
        </div>


        {expandedSite === 1 && (
          <div className="floor-list">
            {loading ? (
              <p>Loading floors...</p>
            ) : (
              floors.map((floor) => (
                <div key={floor.id} className="floor-block">
                  <div className="floor-name" onClick={() => toggleFloor(floor.id)}>
                    ↳ {floor.name}
                    <button
                      className="add-btn"
                      title="Add Room"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFloorId(floor.id);
                        setShowRoomModal(true);
                      }}
                    >
                      ＋
                    </button>
                  </div>
                  {expandedFloor[`1-${floor.id}`] && (
                    <ul className="room-list">
                      <li className="room-name">No rooms yet</li>
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFloorModal && (
        <ModalInput
          title="Add New Floor"
          placeholder="Floor name"
          onClose={() => setShowFloorModal(false)}
          onSubmit={handleFloorSubmit}
        />
      )}

      {showRoomModal && (
        <ModalInput
          title="Add New Room"
          placeholder="Room name"
          onClose={() => setShowRoomModal(false)}
          onSubmit={handleRoomSubmit}
        />
      )}
    </div>
  );
};

export default HierarchySidebar;
