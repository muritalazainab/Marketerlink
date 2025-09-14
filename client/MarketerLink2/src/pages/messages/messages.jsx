import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../../utils/newRequest";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  // Fetch conversations with populated user data
  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get(`/conversations/with-users`).then((res) => res.data),
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
                <th className="font-medium">{currentUser.isSeller ? "Marketer" : "Client"}</th>
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
                
                // Get the other user's information
                const otherUser = currentUser.isSeller ? c.buyerInfo : c.sellerInfo;
                const otherUserName = otherUser?.username || otherUser?.email || 'Unknown User';
                
                return (
                  <tr
                    key={c.id}
                    className={`${isActive ? "bg-green-50" : ""} h-24 border-b border-gray-100 hover:bg-gray-50`}
                  >
                    <td className="font-medium px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {otherUser?.img ? (
                            <img 
                              src={otherUser.img} 
                              alt={otherUserName} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-600">
                              {otherUserName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{otherUserName}</div>
                          <div className="text-xs text-gray-500">
                            {otherUser?.country && `from ${otherUser.country}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-500 px-2 max-w-xs">
                      <Link to={`/message/${c.id}`} className="hover:underline">
                        <div className="truncate">
                          {c?.lastMessage ? c.lastMessage.substring(0, 80) + '...' : 'No messages yet'}
                        </div>
                      </Link>
                    </td>
                    <td className="text-gray-500 px-2">
                      <div className="text-sm">
                        {moment(c.updatedAt).fromNow()}
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <button
                            onClick={() => handleRead(c.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Mark as Read
                          </button>
                        )}
                        <Link
                          to={`/message/${c.id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Open Chat
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {(!data || data.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No conversations yet</div>
              <div className="text-sm">Conversations will appear here when you accept applications or start chatting with clients.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;