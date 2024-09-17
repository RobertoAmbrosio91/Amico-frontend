import { useEffect } from "react";
import io from "socket.io-client";
import useFetchUserDataAsync from "../async_storage/useFetchUserDataAsync";
import { FriendRequest } from "@/types";

const useMyFriendsSocket = (
  friendRequests: FriendRequest[],
  setFriendRequests: any
) => {
  const currentUser = useFetchUserDataAsync();
  useEffect(() => {
    if (currentUser) {
      //   const socket = io("https://7a66-154-27-22-81.ngrok-free.app");
      const socket = io("https://socket.noosk.co");
      socket.emit("my_friends", currentUser._id);

      const handleNewFriendRequest = (friendRequest: any) => {
        setFriendRequests((currentFriendRequests: FriendRequest[]) => {
          return [friendRequest.friendRequest[0], ...currentFriendRequests];
        });
      };

      socket.on("new_friend_request", handleNewFriendRequest);

      // Cleanup function to remove the event listener
      return () => {
        socket.off("new_friend_request", handleNewFriendRequest);
      };
    }
  }, [currentUser, setFriendRequests]); // Ensure setFriendRequests is stable or this could cause issues
};

export default useMyFriendsSocket;
