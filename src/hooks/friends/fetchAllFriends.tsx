import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const fetchAllFriends = async (
  token: string,
  friendsIds: string[]
): Promise<any[]> => {
  try {
    const response = await axios.post(
      "/user/get-all-friends",
      {
        friendsIds: friendsIds,
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
  } catch (error: any) {
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
