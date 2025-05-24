import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { toast, Toaster } from "react-hot-toast";

const HierarchyTree = ({ onSelectRoom }) => {
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expandedFloors, setExpandedFloors] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState({ open: false, floorId: null });
  const [newName, setNewName] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [floorRes, roomRes] = await Promise.all([
          axios.get("http://your-ip:3001/api/floor/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://your-ip:3001/api/room/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setFloors(floorRes.data.floors || []);
        setRooms(roomRes.data.rooms || []);
      } catch (err) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [token]);

  const toggleFloor = (floorId) => {
    setExpandedFloors((prev) =>
      prev.includes(floorId) ? prev.filter((id) => id !== floorId) : [...prev, floorId]
    );
  };

  const addFloor = async () => {
    if (!newName.trim()) return;
    try {
      await axios.post(
        "http://your-ip:3001/api/floor/add",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFloors((prev) => [...prev, { id: Date.now(), name: newName }]);
      toast.success(`✅ Floor "${newName}" created`);
    } catch {
      toast.error("❌ Failed to create floor");
    }
    setNewName("");
    setShowFloorModal(false);
  };

  const addRoom = async () => {
    if (!newName.trim() || !showRoomModal.floorId) return;
    try {
      await axios.post(
        "http://your-ip:3001/api/room/add",
        { name: newName, floor_id: showRoomModal.floorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms((prev) => [
        ...prev,
        { id: Date.now(), name: newName, floor_id: showRoomModal.floorId },
      ]);
      toast.success(`✅ Room "${newName}" created`);
    } catch {
      toast.error("❌ Failed to create room");
    }
    setNewName("");
    setShowRoomModal({ open: false, floorId: null });
  };

  return (
    <div className="text-white font-['Roboto'] text-sm">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 font-semibold text-base text-white">
          <HiBuildingOffice2 className="text-lg" />
          Building Hierarchy
        </div>
        <button
          onClick={() => setShowFloorModal(true)}
          className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-md shadow-md hover:shadow-lg transition"
        >
          <FaPlus className="text-xs" />
          Floor
        </button>
      </div>

      {/* Floors */}
      {floors.map((floor) => (
        <div key={floor.id} className="mb-3">
          <div
            onClick={() => toggleFloor(floor.id)}
            className="flex items-center gap-2 cursor-pointer hover:text-yellow-400 transition"
          >
            {expandedFloors.includes(floor.id) ? (
              <FaChevronDown className="text-xs" />
            ) : (
              <FaChevronRight className="text-xs" />
            )}
            <span>{floor.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRoomModal({ open: true, floorId: floor.id });
              }}
              className="ml-auto flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-md shadow-md hover:shadow-lg transition"
            >
              <FaPlus className="text-xs" />
              Room
            </button>
          </div>

          {expandedFloors.includes(floor.id) && (
            <ul className="ml-6 mt-2 space-y-1 text-gray-300">
              {rooms
                .filter((room) => room.floor_id === floor.id)
                .map((room) => (
                  <li
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      onSelectRoom(room.id);
                    }}
                    className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md transition ${
                      selectedRoomId === room.id
                        ? "bg-teal-700 text-white"
                        : "hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <MdMeetingRoom className="text-sm" />
                    {room.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}

      {/* Floor Modal */}
      {showFloorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-2">Add New Floor</h2>
            <input
              type="text"
              placeholder="Floor name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowFloorModal(false)}
                className="text-sm text-gray-300 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={addFloor}
                className="bg-teal-600 px-4 py-1 text-sm rounded hover:bg-teal-700 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-2">Add New Room</h2>
            <input
              type="text"
              placeholder="Room name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowRoomModal({ open: false, floorId: null })}
                className="text-sm text-gray-300 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={addRoom}
                className="bg-teal-600 px-4 py-1 text-sm rounded hover:bg-teal-700 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTree;

