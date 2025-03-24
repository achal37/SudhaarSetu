"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function ClosedCases() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        let url = new URL(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complaints`
        );

        url.searchParams.append("officer", localStorage.getItem("userId"));

        const response = await fetch(url);
        const data = await response.json();
        setComplaints(data.complaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    }

    fetchComplaints();
  }, []);

  // Filter closed complaints
  const closedComplaints = complaints.filter(
    (complaint) => complaint.status === "resolved"
  );

  return (
    <div>

      <div className="w-fit p-2 bg-[#333436] rounded-lg ml-1 mt-4 text-white text-center">
        Resolved Cases
      </div>

      {/* Complaints List */}
      <div className="mt-4 space-y-4">
        {closedComplaints.length === 0 ? (
          <p className="text-gray-600">No closed cases found.</p>
        ) : (
          closedComplaints.map((complaint) => (
            <div key={complaint.id} className="p-4 border rounded-md shadow-md">
              <h2 className="text-lg font-semibold text-gray-800">
                {complaint.title}
              </h2>
              <p className="text-gray-600">{complaint.description}</p>
              <p className="text-sm text-gray-500">
                Resolved on:{" "}
                {new Date(complaint.resolved_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
