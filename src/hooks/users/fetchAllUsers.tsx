import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const fetchAllUsers = async (token: any): Promise<any[]> => {
  try {
    const response = await axios.get("/user/get-all-users", {
      headers: {
        "x-access-token": token,
      },
    });

    // Adjusted to match the actual response structure based on the API response you shared
    if (response.data && response.data.result) {
      const users = response.data.result;
      return users;
    }
  } catch (error: any) {
    console.error("Error fetching users:", error);
    // More detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure
};

export default fetchAllUsers;
