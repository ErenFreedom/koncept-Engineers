import React, { useState, useEffect } from "react";
import { getFloors, addFloor } from "../../api/floor";
import { getRooms, addRoom } from "../../api/room";
import { useAuth } from "../../context/AuthContext";
import ModalInput from "../ModalInput/ModalInput";
import { toast } from "react-toastify";
import "./HierarchySidebar.css";

const HierarchySidebar = ({ onSiteSelect, onFloorExpand }) => {
  const { admin } = useAuth();

  const [expandedSite, setExpandedSite] = useState(null);
  const [expandedFloor, setExpandedFloor] = useState({});
  const [floors, setFloors] = useState([]);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState(null);

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const token = localStorage.getItem("accessToken");

  const loadFloorsAndRooms = async () => {
    if (!token) return;
    try {
      setLoading(true);

      const fetchedFloors = await getFloors(token);
      setFloors(fetchedFloors || []);

      const fetchedRooms = await getRooms(token);
      const grouped = {};

      fetchedRooms.forEach((room) => {
        if (!grouped[room.floor_id]) grouped[room.floor_id] = [];
        grouped[room.floor_id].push(room);
      });

      setRoomsByFloor(grouped);
    } catch (err) {
      toast.error("❌ Failed to load floors or rooms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloorsAndRooms();
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
      await loadFloorsAndRooms();
      toast.success(`✅ Floor "${name}" added`);
    } catch (err) {
      toast.error("❌ Failed to add floor");
    }
  };

  const handleRoomSubmit = async (name) => {
    if (!activeFloorId) return;
    try {
      await addRoom(activeFloorId, name, token);
      await loadFloorsAndRooms();
      toast.success(`✅ Room "${name}" added to Floor ${activeFloorId}`);
    } catch (err) {
      toast.error("❌ Failed to add room");
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
                      {(roomsByFloor[floor.id] || []).length > 0 ? (
                        roomsByFloor[floor.id].map((room) => (
                          <li key={room.id} className="room-name">
                            • {room.name}
                          </li>
                        ))
                      ) : (
                        <li className="room-name">No rooms yet</li>
                      )}
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
