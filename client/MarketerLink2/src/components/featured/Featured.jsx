import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };

  return (
    <div className="h-[600px] flex justify-center bg-[#013914] text-white">
      <div className="w-[1400px] flex items-center justify-between">
        {/* LEFT */}
        <div className="flex flex-col gap-8">
          <h1 className="text-5xl leading-tight font-bold">
            Find the perfect{" "}
            <span className="italic font-light">freelance</span> services for
            your business
          </h1>

          {/* Search Bar */}
          <div className="flex items-center justify-between bg-white rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-3">
              <img src="./img/search.jpg" alt="" className="w-5 h-5" />
              <input
                type="text"
                placeholder='Try "building mobile app"'
                onChange={(e) => setInput(e.target.value)}
                className="border-none outline-none text-black placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-32 h-12 bg-[#1dbf73] text-white cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Popular */}
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap">Popular:</span>
            <button className="px-3 py-1 border border-white rounded-full text-sm">
              Web Design
            </button>
            <button className="px-3 py-1 border border-white rounded-full text-sm">
              WordPress
            </button>
            <button className="px-3 py-1 border border-white rounded-full text-sm">
              Logo Design
            </button>
            <button className="px-3 py-1 border border-white rounded-full text-sm">
              AI Services
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="h-full">
          <img
            src="/images/man.jpg"
            alt=""
            className="h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default Featured;
