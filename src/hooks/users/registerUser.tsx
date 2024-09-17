import axios from "../axios/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";


// Define the structure of the registration API response
interface RegistrationResponse {
  success: boolean;
  result: UserData;
  // Add any other fields that might be in the response
}

const storeUserData = async (user: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("user", user);
    console.log("User data stored successfully!");
  } catch (error: any) {
    console.log("Error storing user data:", error);
  }
};

export const registerUser = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios.post<RegistrationResponse>("/user/signup", {
      email,
      password,
    });

    if (response.data && response.data.success) {
      const responseDataJson = JSON.stringify(response.data.result);
      console.log(responseDataJson);
      // Storing user data
      storeUserData(responseDataJson);

      return response.data;
    } else if (response.data.success === false) {
      const responseDataJson = JSON.stringify(response.data);
      // console.log("Response Data (JSON) :", responseDataJson);
      return response.data;
    } else {
      console.log("Empty response or no data returned.");
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
      return error.response.data.message;
    } else {
      console.error("Error registering:", error);
    }
    Sentry.captureException(error);
  }
};

