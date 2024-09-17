import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Define the structure of a friend request object based on the provided API response
export type FriendRequest = {
  _id: string;
  sender_data: {
    first_name: string;
    last_name: string;
    profile: string;
    user_name: string;
  };
  friend_request_id: string;
};

// The function now returns a Promise with an array of FriendRequest objects
const fetchFriendRequests = async (token: string): Promise<FriendRequest[]> => {
  try {
    const response = await axios.get("/user/fetch-friend-requests", {
      headers: {
        "x-access-token": token,
      },
    });

    if (response.data && response.data.success) {
      // Cast the result to an array of FriendRequest objects
      const friendRequests: FriendRequest[] = response.data.result;
      return friendRequests;
    } else {
      // Handle any case where success is false, which could include an error message
      console.error(
        response.data.message || "Fetch friend requests was not successful"
      );
    }
  } catch (error) {
    console.error("Error fetching friend requests", error);
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure or no friend requests
};

export default fetchFriendRequests;
