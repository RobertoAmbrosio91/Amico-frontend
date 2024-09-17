import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";

const storeUserData = async (user: UserData): Promise<void> => {
  try {
    const userString = JSON.stringify(user);
    await AsyncStorage.setItem("user", userString);
    console.log("User data stored successfully!");
  } catch (error) {
    console.error("Error storing user data:", error);
    Sentry.captureException(error);
  }
};

export default storeUserData;

