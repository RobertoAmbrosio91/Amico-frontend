import { useEffect } from "react";
import io from "socket.io-client";
import useFetchUserDataAsync from "../async_storage/useFetchUserDataAsync";
import { FriendRequest } from "@/types";
import { addFriendToUser } from "../async_storage/updateUserFriendsAsync";

const useFriendRequestsSocket = () => {
  const currentUser = useFetchUserDataAsync();
  useEffect(() => {
    if (currentUser) {
      //   const socket = io("https://b2c4-154-27-22-81.ngrok-free.app");
      const socket = io("https://socket.noosk.co");
      socket.emit(`friend_requests`, currentUser._id);
      socket.on("friend_request_accepted", (friendId: string) => {
        addFriendToUser(friendId);
      });

      return () => {
        socket.off("new_friend_request");
      };
    }
  }, [currentUser]); // Ensure setFriendRequests is stable or this could cause issues
};

export default useFriendRequestsSocket;
