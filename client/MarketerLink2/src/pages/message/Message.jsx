import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../../utils/newRequest";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (message) => newRequest.post(`/messages`, message),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };

  return (
    <div className="flex justify-center">
      <div className="w-[1200px] m-12">
        {/* Breadcrumbs */}
        <span className="font-medium text-[1.5rem] text-blue-800">
          <Link to="/messages">Messages</Link> 
        </span>

        {/* Messages */}
        {isLoading ? (
          "loading"
        ) : error ? (
          "error"
        ) : (
          <div className="my-8 p-12 flex flex-col gap-5 h-[500px] overflow-y-scroll">
            {data.map((m) => (
              <div
                key={m._id}
                className={`flex gap-5 max-w-[600px] text-lg ${
                  m.userId === currentUser._id
                    ? "flex-row-reverse self-end"
                    : ""
                }`}
              >
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt=""
                />
                <p
                  className={`max-w-[500px] p-5 font-light ${
                    m.userId === currentUser._id
                      ? "rounded-[20px_0px_20px_20px] bg-royalblue text-blue"
                      : "rounded-[0px_20px_20px_20px] bg-gray-100 text-gray-600"
                  }`}
                >
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <hr className="border border-gray-200 mb-5" />

        {/* Write Box */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-between"
        >
          <textarea
            type="text"
            placeholder="write a message"
            className="w-4/5 h-[100px] p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 p-5 text-white font-medium rounded-lg w-[100px] cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;
