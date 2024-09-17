import { useState } from 'react';
import axios from '../axios/axiosConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addFriendToUser } from "../async_storage/updateUserFriendsAsync";
import * as Sentry from "@sentry/react-native";


const useAcceptFriendRequests = (token: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const acceptFriendRequest = async (friendRequestId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "/user/accept-friend-request",
        { friend_request_id: friendRequestId },
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (response.data && response.data.success) {
        addFriendToUser(response.data.result.friend_id);
        console.log(response.data.result.friend_id);
      } else {
        // Handle the failure case
        setError(response.data.message || "Failed to accept friend request");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "An error occurred while accepting the friend request"
      );
      Sentry.captureException(error);
    }

    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    acceptFriendRequest,
  };
};

export default useAcceptFriendRequests;
