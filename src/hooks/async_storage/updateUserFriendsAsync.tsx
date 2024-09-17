import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";

export const addFriendToUser = async (friendId: string): Promise<void> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser !== null) {
      const currentUser = JSON.parse(storedUser);

      const friendsArray = currentUser.friends ? currentUser.friends : [];

      if (!friendsArray.includes(friendId)) {
        const updatedFriendsArray = [...friendsArray, friendId];

        const updatedUser = { ...currentUser, friends: updatedFriendsArray };

        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        // console.log("friend added", updatedUser.friends);
      } else {
        console.log("This friend is already added.");
      }
    } else {
      // Handle the case where there is no user data stored yet
      console.error("No user data found in storage.");
    }
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error adding friend to user:", error);
    Sentry.captureException(error);
  }
};
