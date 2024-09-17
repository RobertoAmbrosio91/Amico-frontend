import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Define the structure of the API response
interface LogoutResponse {
  success: boolean;
  message: string;
}

const logout = async (
  token: string
): Promise<boolean | undefined> => {
  try {
    const response = await axios.post<LogoutResponse>(
      "/user/logout",
      {},
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    if (response && response.data && response.data.success) {
      // console.log(response.data.message);
      return response.data.success;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
};

export default logout;

