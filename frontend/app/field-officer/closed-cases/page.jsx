"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { Image as ImageIcon, MapPin, Repeat, Eye } from "lucide-react";
const DynamicMapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
});

function ClosedCases() {
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [viewMode, setViewMode] = useState({}); // Tracks image/map toggle state
  const [showResolved, setShowResolved] = useState({}); // Tracks resolved image visibility

  useEffect(() => {
    async function fetchClosedComplaints() {
      try {
        const ward = localStorage.getItem("user-ward");
        const url = new URL(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complaints`
        );
        url.searchParams.append("ward", ward);

        const response = await fetch(url);
        const data = await response.json();

        const filteredComplaints = data.complaints.filter(
          (complaint) => complaint.status === "resolved"
        );

        setClosedComplaints(filteredComplaints);
      } catch (error) {
        console.error("Error fetching closed complaints:", error);
      }
    }
    fetchClosedComplaints();
  }, []);

  const toggleViewMode = (id) => {
    setViewMode((prev) => ({
      ...prev,
      [id]: prev[id] === "map" ? "image" : "map",
    }));
  };

  const toggleResolvedImage = (id) => {
    setShowResolved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-primary mb-6">Closed Cases</h2>

      {closedComplaints.length === 0 ? (
        <p className="text-secondary">No resolved complaints in your ward.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {closedComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-background shadow-md rounded-lg p-5 border border-gray-300"
            >
              <h3 className="text-xl font-semibold text-text">
                {complaint.category}
              </h3>
              <p className="text-secondary text-sm mt-1">
                {complaint.description}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  className="text-sm px-4 py-2 rounded bg-primary text-white flex items-center gap-2 hover:bg-accent transition"
                  onClick={() => toggleViewMode(complaint.id)}
                >
                  {viewMode[complaint.id] === "map" ? (
                    <ImageIcon size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                  {viewMode[complaint.id] === "map" ? "View Image" : "View Map"}
                </button>

                <button
                  className="text-sm px-4 py-2 rounded bg-secondary text-white flex items-center gap-2 hover:bg-gray-700 transition"
                  onClick={() => toggleResolvedImage(complaint.id)}
                >
                  <Eye size={18} />{" "}
                  {showResolved[complaint.id]
                    ? "Hide Resolved"
                    : "Show Resolved"}
                </button>
              </div>

              <div className="w-full h-60 mt-3 border border-gray-400 rounded-lg overflow-hidden relative">
                {/* Before Image or Map - Base Layer */}
                {viewMode[complaint.id] !== "map" ? (
                  complaint.image ? (
                    <Image
                      src={complaint.image}
                      alt="Before Image"
                      width={600}
                      height={240}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Before Image Not Available
                    </div>
                  )
                ) : complaint.location ? (
                  <DynamicMapView
                    location={complaint.location}
                    category={complaint.category}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Invalid location data
                  </div>
                )}

                {/* Resolved Image - Overlay Layer */}
                {showResolved[complaint.id] && complaint.resolved_image && (
                  <Image
                    src={complaint.resolved_image}
                    alt="Resolved Image"
                    width={600}
                    height={240}
                    className="absolute top-0 left-0 w-full h-full object-cover z-10 rounded"
                    loading="lazy"
                  />
                )}

                {/* Optional: fallback text if resolved image not available */}
                {showResolved[complaint.id] && !complaint.resolved_image && (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-70 z-10 rounded text-gray-500">
                    Resolved Image Not Available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClosedCases;
