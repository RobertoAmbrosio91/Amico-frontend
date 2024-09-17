import axios from "axios";
import { NotificationType } from "../../types";
import * as Sentry from "@sentry/react-native";


const fetchUserNotifications = async (
  page: number, 
  per_page: number, 
  token: string
): Promise<NotificationType[]> => { // Replace 'any[]' with the actual return type
  try {
    const response = await axios.post(
      "/user/notification",
      {
        per_page: per_page,
        page: page,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      // console.log("Notifications fetched successfully");
      return response.data.result.data;
    }
  } catch (error: any) { // Consider using a more specific error type if available
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure
};

export default fetchUserNotifications;
