import axios from "../axios/axiosConfig";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";

// Define the structure of the API response
interface FetchUserDataResponse {
  success: boolean;
  message: string;
  result: UserData;
}

const fetchUserData = async (
  user_id: string,
  token: string
): Promise<UserData | undefined> => {
  try {
    const response = await axios.post<FetchUserDataResponse>(
      "/user/profile-data",
      { user_id },
      { headers: { "x-access-token": token } }
    );

    if (response.data && response.data.success) {
      const user_data = response.data.result;
      // console.log(user_data);
      return user_data;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error("Error fetching data :", error);
    }
    Sentry.captureException(error);
  }
};

export default fetchUserData;

