"use client";

import { useState } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Image as ImageIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ComplainCard({ complaint }) {
  const [viewMode, setViewMode] = useState(false);

  // Pin icon for map markers
  const pinIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });

  // Toggle between map and image view
  const toggleView = () => setViewMode(!viewMode);

  return (
    <div className="bg-[#F8E7D2] shadow-lg rounded-xl p-5 border border-gray-300 relative max-w-[600px] mx-auto sm:max-w-full max-w-[90%]">
      {/* Category */}
      <h3 className="text-lg md:text-xl font-semibold text-gray-800">
        {complaint.category}
      </h3>

      {/* View Map Button */}
      <button
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-orange-400 text-white font-medium shadow-md text-sm md:text-base transition hover:bg-orange-500"
        onClick={toggleView}
      >
        {viewMode ? <ImageIcon size={18} /> : <MapPin size={18} />}
        {viewMode ? "View Image" : "View Map"}
      </button>

      {/* Carousel */}
      <div className="mt-4">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 20,
            stretch: 50,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={{ delay: 3000 }}
          pagination={true}
          modules={[EffectCoverflow, Pagination]}
          className="w-full max-w-3xl"
        >
          {viewMode ? (
            <SwiperSlide>
              {complaint.location ? (
                <MapContainer
                  center={complaint.location.split(",").map(Number)}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="w-full h-[250px] sm:h-[300px] md:h-[350px] rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={complaint.location.split(",").map(Number)}
                    icon={pinIcon}
                  >
                    <Popup>{complaint.category} reported here.</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] sm:h-[300px] bg-gray-100 text-gray-500">
                  Invalid location data
                </div>
              )}
            </SwiperSlide>
          ) : complaint.image ? (
            <SwiperSlide>
              <Image
                src={complaint.image}
                alt={`Complaint Image`}
                width={500}
                height={300}
                className="w-full h-auto object-cover rounded-lg"
              />
            </SwiperSlide>
          ) : (
            <SwiperSlide>
              <div className="flex items-center justify-center h-[250px] sm:h-[300px] bg-gray-100 text-gray-500">
                No image available
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Status and Reactions */}
      <div className="mt-4 flex flex-wrap justify-between items-center w-full gap-3">
        <div className="flex gap-2">
          {/* Likes and Dislikes */}
          <div className="flex items-center border border-gray-400 rounded-full overflow-hidden shadow-md">
            <button className="flex items-center gap-1.5 px-3 py-1 bg-orange-300 hover:bg-orange-400 transition">
              <ThumbsUp size={16} />
              <span>{complaint.upvotes}</span>
            </button>
            <div className="w-[1px] h-full bg-gray-400"></div>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-200 hover:bg-gray-300 transition">
              <ThumbsDown size={16} />
              <span>{complaint.downvotes || 0}</span>
            </button>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-2 px-3 py-1 border border-gray-400 bg-orange-300 hover:bg-orange-400 rounded-full shadow-md transition">
            <MessageCircle size={16} />
            <span>{complaint.total_comments}</span>
          </div>

          {/* Ward */}
          <div className="flex items-center gap-2 px-3 py-1 border border-gray-400 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md transition">
            Ward: {complaint.ward_no}
          </div>
        </div>

        {/* Status */}
        <span
          className={`px-5 py-1 border border-gray-400 rounded-full font-medium shadow-md ${
            complaint.status === "pending" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
          }`}
        >
          {complaint.status}
        </span>
      </div>

      {/* Comments Section */}
      <div className="mt-5 border-t border-gray-400 pt-3 w-full">
        <h3 className="font-semibold text-gray-800">Top Comments:</h3>
        {complaint?.commentsList?.map((comment, index) => (
          <div
            key={index}
            className="mt-3 flex flex-col sm:flex-row items-start gap-3 bg-gray-100 p-3 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
              {comment.user.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {comment.user} <span className="text-gray-500">- {comment.time}</span>
              </p>
              <p className="text-gray-600">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComplainCard;
