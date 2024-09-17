import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types"; // Replace './types' with the actual path to your UserData type
import * as Sentry from "@sentry/react-native";

export const updateUserInStorage = async (
  updatedUser: Partial<UserData>
): Promise<void> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");

    if (storedUser !== null) {
      // If there's existing user data, merge it with the updated user data
      const mergedUser = { ...JSON.parse(storedUser), ...updatedUser };
      await AsyncStorage.setItem("user", JSON.stringify(mergedUser));
    } else {
      // If there's no existing user data, store the updated user data
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    }
  } catch (error) {
    console.error("Error updating user data:", error);
    Sentry.captureException(error);
  }
};

