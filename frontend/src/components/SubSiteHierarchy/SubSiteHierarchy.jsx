import React, { useState, useEffect } from "react";
import {
    getSubsiteFloors,
    addSubsiteFloor,
    deleteSubsiteFloor,
} from "../../api/floor";
import {
    getSubsiteRooms,
    addSubsiteRoom,
    deleteSubsiteRoom,
} from "../../api/room";
import {
    getSubsiteSensors,
    unassignSensorFromSubsiteRoom,
} from "../../api/sensor";

import ModalInput from "../ModalInput/ModalInput";
import { toast } from "react-toastify";
import "./SubSiteHierarchy.css";

const SubSiteHierarchy = ({ subsite, token, onRoomSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const [floors, setFloors] = useState([]);
    const [roomsByFloor, setRoomsByFloor] = useState({});
    const [activeFloorId, setActiveFloorId] = useState(null);

    const [showFloorModal, setShowFloorModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [confirmDeleteFloor, setConfirmDeleteFloor] = useState(null);
    const [confirmDeleteRoom, setConfirmDeleteRoom] = useState(null);

    useEffect(() => {
        if (!expanded) return;

        const loadHierarchy = async () => {
            try {
                const floorList = await getSubsiteFloors(token, subsite.id);
                const roomList = await getSubsiteRooms(token, subsite.id);

                setFloors(floorList);

                const groupedRooms = {};
                roomList.forEach((room) => {
                    if (!groupedRooms[room.floor_id]) groupedRooms[room.floor_id] = [];
                    groupedRooms[room.floor_id].push(room);
                });

                setRoomsByFloor(groupedRooms);
            } catch (err) {
                console.error(`❌ Failed loading subsite ${subsite.name} data:`, err);
            }
        };

        loadHierarchy();
    }, [expanded, token, subsite.id]);

    const reload = () => {
        if (expanded) {
            setExpanded(false);
            setTimeout(() => setExpanded(true), 50); // Force re-render
        }
    };

    const toggleExpand = () => setExpanded((prev) => !prev);

    const handleAddFloor = async (name) => {
        try {
          
          await addSubsiteFloor(name, subsite.id, token);
          toast.success(`✅ Floor "${name}" added`);
          reload();
        } catch (err) {
          toast.error("❌ Failed to add floor");
        }
      };
      

      const handleAddRoom = async (name) => {
        try {
          if (!activeFloorId) return;
          await addSubsiteRoom(activeFloorId, name, subsite.id, token);
          toast.success(`✅ Room "${name}" added`);
          reload();
        } catch (err) {
          toast.error("❌ Failed to add room");
        }
      };
      

      const handleDeleteFloor = async () => {
        try {
          await deleteSubsiteFloor(confirmDeleteFloor.id, subsite.id, token);
          toast.success(`🗑️ Floor "${confirmDeleteFloor.name}" deleted`);
          setConfirmDeleteFloor(null);
          reload();
        } catch (err) {
          toast.error("❌ Failed to delete floor");
        }
      };
      

      const handleDeleteRoom = async () => {
        try {
          await deleteSubsiteRoom(confirmDeleteRoom.id, subsite.id, token);
          toast.success(`🗑️ Room "${confirmDeleteRoom.name}" deleted`);
          setConfirmDeleteRoom(null);
          reload();
        } catch (err) {
          toast.error("❌ Failed to delete room");
        }
      };
      

    return (
        <div className="subsite-block">
            <div className="site-name" onClick={toggleExpand}>
                ▸ {subsite.name}
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

            {expanded && (
                <div className="floor-list">
                    {floors.map((floor) => (
                        <div key={floor.id} className="floor-block">
                            <div
                                className="floor-name"
                                onClick={() =>
                                    setActiveFloorId((prev) => (prev === floor.id ? null : floor.id))
                                }
                            >
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
                                <button
                                    className="delete-btn"
                                    title="Delete Floor"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteFloor(floor);
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>

                            {activeFloorId === floor.id && (
                                <ul className="room-list">
                                    {(roomsByFloor[floor.id] || []).map((room) => (
                                        <li key={room.id} className="room-name">
                                            <span onClick={() => onRoomSelect && onRoomSelect(room)}>
                                                • {room.name}
                                            </span>
                                            <button
                                                className="delete-btn"
                                                title="Delete Room"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteRoom(room);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showFloorModal && (
                <ModalInput
                    title={`Add Floor to ${subsite.name}`}
                    placeholder="Floor name"
                    onClose={() => setShowFloorModal(false)}
                    onSubmit={handleAddFloor}
                />
            )}

            {showRoomModal && (
                <ModalInput
                    title={`Add Room to Floor`}
                    placeholder="Room name"
                    onClose={() => setShowRoomModal(false)}
                    onSubmit={handleAddRoom}
                />
            )}

            {confirmDeleteFloor && (
                <div className="confirm-modal">
                    <div className="confirm-modal-content">
                        <p>Delete floor <strong>{confirmDeleteFloor.name}</strong>?</p>
                        <div className="modal-buttons">
                            <button onClick={handleDeleteFloor} className="modal-confirm">Yes</button>
                            <button onClick={() => setConfirmDeleteFloor(null)} className="modal-cancel">No</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDeleteRoom && (
                <div className="confirm-modal">
                    <div className="confirm-modal-content">
                        <p>Delete room <strong>{confirmDeleteRoom.name}</strong>?</p>
                        <div className="modal-buttons">
                            <button onClick={handleDeleteRoom} className="modal-confirm">Yes</button>
                            <button onClick={() => setConfirmDeleteRoom(null)} className="modal-cancel">No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubSiteHierarchy;
