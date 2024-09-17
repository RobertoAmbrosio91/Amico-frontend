import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";


const saveToken = async (fcm_token: string, token: string): Promise<void> => {
  try {
    const response = await axios.post(
      "/user/save-token",
      {
        firebase_token: fcm_token,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      console.log("hey", response.data.message);
    }
  } catch (error: any) { 
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error("Error saving token : ", error);
    }
    Sentry.captureException(error);
  }
};

export default saveToken;
