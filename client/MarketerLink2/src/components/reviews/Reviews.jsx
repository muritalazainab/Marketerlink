import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import newRequest from "../../../utils/newRequest";
import Review from "../review/Review";

const Reviews = ({ gigId }) => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (review) => newRequest.post("/reviews", review),
    onSuccess: () => queryClient.invalidateQueries(["reviews"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    const star = e.target[1].value;
    mutation.mutate({ gigId, desc, star });
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>

      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        data.map((review) => <Review key={review._id} review={review} />)
      )}

      <div className="mt-8 flex flex-col gap-5">
        <h3 className="text-xl font-medium">Add a review</h3>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Write your opinion"
            className="p-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            className="w-48 p-5 border border-gray-300 rounded-md self-end focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button
            type="submit"
            className="self-end w-24 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>

      <hr className="border-t border-gray-300 my-12" />
    </div>
  );
};

export default Reviews;
