import { useQuery } from "@tanstack/react-query";
// import newRequest from "../utils/newRequest";

const useUnreadConversationsCount = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["unreadConversationsCount", currentUser?.id],
    queryFn: () => {
      if (!currentUser) return 0;
      return newRequest
        .get(`/conversations/unread-count`)
        .then((res) => res.data.count);
    },
    refetchInterval: 30000, // refresh every 30s
    enabled: !!currentUser, // only run if user is logged in
  });

  return { isLoading, error, unreadCount: data || 0, refetch };
};

export default useUnreadConversationsCount;
