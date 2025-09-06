import { useQuery } from "@tanstack/react-query";
import React from "react";
import newRequest from "../../../utils/newRequest";

const Review = ({ review }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [review.userId],
    queryFn: () =>
      newRequest.get(`/users/${review.userId}`).then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-5 my-5">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={data.img || "/img/noavatar.jpg"}
            alt=""
          />
          <div className="flex flex-col">
            <span className="font-medium">{data.username}</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{data.country}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {Array(review.star)
          .fill()
          .map((_, i) => (
            <img src="/img/star.jpg" alt="" key={i} className="w-3.5 h-3.5" />
          ))}
        <span className="text-sm font-bold text-yellow-400">{review.star}</span>
      </div>

      <p className="text-gray-700">{review.desc}</p>

      <div className="flex items-center gap-2">
        <span className="text-sm">Helpful?</span>
        <img src="/img/like.jpg" alt="" className="w-3.5 h-3.5" />
        <span className="text-sm">Yes</span>
        <img src="/img/dislike.jpg" alt="" className="w-3.5 h-3.5" />
        <span className="text-sm">No</span>
      </div>
    </div>
  );
};

export default Review;
