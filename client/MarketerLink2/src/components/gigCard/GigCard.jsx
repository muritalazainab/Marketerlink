import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../../utils/newRequest";

const GigCard = ({ item, hasApplied = false, applicationStatus = null, showApplyButton = true }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => res.data),
  });

  const getStatusBadge = () => {
    if (!hasApplied) return null;
    
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      default: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Applied' }
    };

    const config = statusConfig[applicationStatus] || statusConfig.default;
    
    return (
      <div className="absolute top-3 right-3 z-10">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Main Card */}
      <div className="w-[324px] h-[400px] border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="relative h-full flex flex-col">
          {/* Status Badge */}
          {getStatusBadge()}
          
          {/* Cover image */}
          <img
            src={item.cover}
            alt=""
            className="w-full h-1/2 object-cover"
          />

          {/* Info section */}
          <div className="p-3 flex flex-col gap-4 flex-1">
            {isLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : error ? (
              <span className="text-red-500">Something went wrong!</span>
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src={data?.img || "/images/noavatar.jpg"}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="font-medium">{data?.username}</span>
              </div>
            )}

            <p className="text-gray-800 text-sm line-clamp-3">{item.desc}</p>

            <div className="flex items-center gap-2">
              <img src="/images/star.jpg" alt="" className="w-4 h-4" />
              <span className="text-sm font-bold text-yellow-500">
                {!isNaN(item.totalStars / item.starNumber) &&
                  Math.round(item.totalStars / item.starNumber)}
              </span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Detail section */}
          <div className="p-3 flex items-center justify-between">
            <img
              src="/images/heart.jpg"
              alt=""
              className="w-4 h-4 cursor-pointer"
            />
            <div className="text-right">
              <span className="block text-gray-500 text-xs">STARTING AT</span>
              <h2 className="text-gray-700 text-lg font-medium">
                $ {item.price}
              </h2>
            </div>
          </div>
        </div>
      </div>
      
   
       {hasApplied && showApplyButton ? (
  <div className="mt-3">
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
        ${
          applicationStatus === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : applicationStatus === "accepted"
            ? "bg-green-100 text-green-700"
            : applicationStatus === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
        }`}
    >
      {applicationStatus === "pending"
        ? "Application Pending"
        : applicationStatus === "accepted"
        ? "Application Accepted"
        : applicationStatus === "rejected"
        ? "Application Rejected"
        : "Already Applied"}
    </span>
  </div>
) : (
  <Link to={`/gig/${item._id}`} className="absolute inset-0 z-0" />
)}

    </div>
  );
};

export default GigCard;