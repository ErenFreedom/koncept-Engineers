import React, { useState, useEffect } from "react";
import { getFloors, addFloor } from "../../api/floor"; 
import { addRoom } from "../../api/room"; 
import "./HierarchySidebar.css";

const HierarchySidebar = ({ onSiteSelect, onFloorExpand }) => {
  const [expandedSite, setExpandedSite] = useState(null);
  const [expandedFloor, setExpandedFloor] = useState({});
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState(null); 

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

  const handleAddFloor = async () => {
    const name = prompt("Enter floor name:");
    if (!name) return;

    try {
      await addFloor(name, token);
      const updated = await getFloors(token);
      setFloors(updated || []);
    } catch (err) {
      console.error("Failed to add floor:", err.message);
      alert("❌ Could not add floor");
    }
  };

  const handleAddRoom = async () => {
    const name = prompt("Enter room name:");
    if (!name || !activeFloorId) return;

    try {
      await addRoom(activeFloorId, name, token);
      alert(`Room "${name}" added to Floor ${activeFloorId}`);
      // TODO: Reload rooms if displaying them
    } catch (err) {
      console.error("Failed to add room:", err.message);
      alert("❌ Could not add room");
    }
  };

  return (
    <div className="hierarchy-sidebar">
      <h3 className="sidebar-heading">Building</h3>

      <div className="site-block">
        <div className="site-name" onClick={() => toggleSite(1)}>
          ▸ Site Alpha
          <button className="add-btn" title="Add Floor" onClick={handleAddFloor}>＋</button>
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
                        handleAddRoom();
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
    </div>
  );
};

export default HierarchySidebar;
