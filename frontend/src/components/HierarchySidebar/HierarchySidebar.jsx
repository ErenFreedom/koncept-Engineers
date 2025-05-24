import React, { useState } from "react";
import "./HierarchySidebar.css";

const HierarchySidebar = ({ onSiteSelect, onFloorExpand }) => {
  const [expandedSite, setExpandedSite] = useState(null);
  const [expandedFloor, setExpandedFloor] = useState({});

  const sites = [
    {
      id: 1,
      name: "Site Alpha",
      floors: [
        {
          id: 1,
          name: "Floor 1",
          rooms: ["Room 101", "Room 102"],
        },
        {
          id: 2,
          name: "Floor 2",
          rooms: ["Room 201", "Room 202"],
        },
      ],
    },
    {
      id: 2,
      name: "Site Beta",
      floors: [
        {
          id: 1,
          name: "Main Floor",
          rooms: ["Room A", "Room B"],
        },
      ],
    },
  ];

  const toggleSite = (siteId) => {
    const isExpanding = expandedSite !== siteId;
    setExpandedSite(isExpanding ? siteId : null);

    if (onSiteSelect) {
      onSiteSelect(isExpanding ? siteId : null);
    }
  };

  const toggleFloor = (siteId, floorId) => {
    const key = `${siteId}-${floorId}`;
    const isExpanding = !expandedFloor[key];

    setExpandedFloor((prev) => ({
      ...prev,
      [key]: isExpanding,
    }));

    if (onFloorExpand && isExpanding) {
      onFloorExpand(floorId); // trigger zoom
    }
  };

  return (
    <div className="hierarchy-sidebar">
      <h3 className="sidebar-heading">Building</h3>

      {sites.map((site) => (
        <div key={site.id} className="site-block">
          <div className="site-name" onClick={() => toggleSite(site.id)}>
            ▸ {site.name}
            <button className="add-btn" title="Add Floor">＋</button>
          </div>

          {expandedSite === site.id && (
            <div className="floor-list">
              {site.floors.map((floor) => (
                <div key={floor.id} className="floor-block">
                  <div
                    className="floor-name"
                    onClick={() => toggleFloor(site.id, floor.id)}
                  >
                    ↳ {floor.name}
                    <button className="add-btn" title="Add Room">＋</button>
                  </div>

                  {expandedFloor[`${site.id}-${floor.id}`] && (
                    <ul className="room-list">
                      {floor.rooms.map((room, idx) => (
                        <li key={idx} className="room-name">
                          • {room}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HierarchySidebar;
