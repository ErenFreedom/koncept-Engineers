import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


const DataSetup = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [error, setError] = useState(null);

  // This effect simulates fetching hierarchy data from backend
  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dummy GET request (replace URL with actual endpoint later)
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/data-setup/hierarchy`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setHierarchyData(response.data); // expected to be an array or object
      } catch (err) {
        setError("Failed to fetch data setup info.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [accessToken]);

  return (
    <div className="data-setup-container">
      <h2>📊 Data Setup</h2>

      {loading ? (
        <p>Loading hierarchy data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="hierarchy-preview">
          <pre>{JSON.stringify(hierarchyData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DataSetup;
