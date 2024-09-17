import { useState } from 'react';
import axios from '../axios/axiosConfig';
import * as Sentry from "@sentry/react-native";

const useManageCloseFriends = (token: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleCloseFriend = async (closeFriendId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        '/user/add-remove-close-friend',
        { close_friendId: closeFriendId },
        {
          headers: {
            'x-access-token': token,
          },
        }
      );

      if (response.data && response.data.success) {
        // Handle the success case
        // You might want to update the close friends list in your state/context here
      } else {
        // Handle the failure case
        setError(response.data.message || 'Failed to update close friends list');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while updating the close friends list');
      Sentry.captureException(error);
    }

    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    toggleCloseFriend,
  };
};

export default useManageCloseFriends;
