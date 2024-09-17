import { useState } from 'react';
import axios from '../axios/axiosConfig';
import * as Sentry from "@sentry/react-native";

const useSendFriendRequest = (token: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendFriendRequest = async (receiverId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        '/user/send-friend-request',
        { receiver_id: receiverId },
        {
          headers: {
            'x-access-token': token,
          },
        }
      );

      if (response.data && response.data.success) {
      } else {
        // Handle the failure case
        setError(response.data.message || 'Failed to send friend request');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while sending the friend request');
      Sentry.captureException(error);
    }

    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    sendFriendRequest,
  };
};

export default useSendFriendRequest;
