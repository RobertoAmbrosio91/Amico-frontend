import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Assuming the function returns an array of a certain type, for example, User[]
// Replace 'any[]' with the actual type of your user objects, if available
const fetchAllFriends = async (
  friendsIds: string[], 
  token: string
): Promise<any[]> => { // Replace 'any[]' with the actual return type
  try {
    const response = await axios.post(
      "/user/get-all-friends",
      {
        friendsIds
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    
    if (response.data && response.data.success) {
      const friends = response.data.result;
      return friends;
    }
  } catch (error: any) { // Consider using a more specific error type if available
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error("Error fetching friends", error);
    }
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure
};

export default fetchAllFriends;
