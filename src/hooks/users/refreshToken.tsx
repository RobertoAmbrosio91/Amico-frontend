import { updateUserInStorage } from "../async_storage/updateUserInStorage";
import axios from "../axios/axiosConfig";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";



// Define the structure of the API response
interface RefreshTokenResponse {
  success: boolean;
  result: UserData;
  message: string;
  // Add any other fields that might be in the response
}

const refreshToken = async (token: string): Promise<void> => {
  try {
    const response = await axios.get<RefreshTokenResponse>("/user/auth", {
      headers: {
        "x-access-token": token,
      },
    });

    if (response.data.success) {
      console.log("token refreshed");
      updateUserInStorage(response.data.result);
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
      Sentry.captureException(error);
      throw error;
    } else {
      console.log("Token not refreshed", error);
      Sentry.captureException(error);
      throw error;
    }
  }
};

export default refreshToken;

