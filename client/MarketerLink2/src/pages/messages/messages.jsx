import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../../utils/newRequest";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get(`/conversations`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.put(`/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["conversations"]),
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="flex justify-center text-gray-700">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="w-[1400px] py-12">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-semibold">Messages</h1>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="h-24 text-left">
                <th className="font-medium">{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const isActive =
                  (currentUser.isSeller && !c.readBySeller) ||
                  (!currentUser.isSeller && !c.readByBuyer);
                return (
                  <tr
                    key={c.id}
                    className={`${isActive ? "bg-green-50" : ""} h-24`}
                  >
                    <td className="font-medium px-2">{currentUser.isSeller ? c.buyerId : c.sellerId}</td>
                    <td className="text-gray-500 px-2">
                      <Link to={`/message/${c.id}`} className="hover:underline">
                        {c?.lastMessage?.substring(0, 100)}...
                      </Link>
                    </td>
                    <td className="text-gray-500 px-2">{moment(c.updatedAt).fromNow()}</td>
                    <td className="px-2">
                      {isActive && (
                        <button
                          onClick={() => handleRead(c.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;
