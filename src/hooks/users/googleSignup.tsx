import axios from "../axios/axiosConfig";
import storeUserData from "../async_storage/storeUser";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";


// Define the structure of the API response
interface GoogleSignupResponse {
  success: boolean;
  message: string;
  result: UserData;
}

const googleSignup = async (
  email: string,
  social_id: string,
  first_name: string,
  last_name: string
): Promise<GoogleSignupResponse | undefined> => {
  try {
    const response = await axios.post<GoogleSignupResponse>("/user/social-login", {
      email,
      social_id,
      first_name,
      last_name,
      sign_up_type: "google",
    });

    if (response.data && response.data.success) {
      // console.log("User registered successfully");
      const userData = response.data;
      storeUserData(userData.result); // Ensure storeUserData accepts UserData type
      return userData;
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

export default googleSignup;
