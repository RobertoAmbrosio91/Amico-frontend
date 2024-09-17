import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import googleSignup from "../users/googleSignup";
import * as Sentry from "@sentry/react-native";


const ANDROID_CLIENT_ID =
  "1045395831825-hliin2g7mrq9d9s0sq9sfuuf9q1blpts.apps.googleusercontent.com";

const IOS_CLIENT_ID =
  "1045395831825-i2vqma9lpmh3u44m78ton9bpeb5dqqsc.apps.googleusercontent.com";

const WEB_CLIENT_ID =
  "949639299233-27csiit4pge6v2nd1aqs4gmeclu1mscd.apps.googleusercontent.com";
  
WebBrowser.maybeCompleteAuthSession();

const config = {
  androidClientId: ANDROID_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  webClientId: WEB_CLIENT_ID,
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest(config);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  // Function to get user info from the token
  const getUserInfo = async (token: any) => {
    console.log("Fetching user info with token:", token);
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Check if the response is not ok (status code outside of 2xx range)
      if (!response.ok) {
        throw new Error(
          `HTTP status ${response.status}: ${response.statusText}`
        );
      }

      const user = await response.json();
      console.log("Extracted user info:", user);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch user data:", error.message);
      } else {
        console.error("An unexpected error occurred");
      }
      Sentry.captureException(error);
    }
  };

  // Function to handle Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const userJSON = await AsyncStorage.getItem("user");
      if (userJSON) {
        setUserInfo(JSON.parse(userJSON));
      } else if (response?.type === "success") {
        getUserInfo(response.authentication?.accessToken);
      }
    } catch (error) {
      console.error("Error retrieving user data from AsyncStorage:", error);
      Sentry.captureException(error);
    }
  };

  useEffect(() => {
    signInWithGoogle();
  }, [response]);

  const onGoogleButtonPress = () => {
    console.log("Initiating Google Sign-In");
    promptAsync();
  };

  useEffect(() => {
    console.log("User info state updated:", userInfo);
    if (userInfo) {
      const { email, id, given_name, family_name } = userInfo;
      console.log("Sending to googleSignup:", {
        email: email,
        social_id: id, // Make sure this is the Google ID you received
        first_name: given_name,
        last_name: family_name,
      });
      // Call the googleSignup function with the correct field names
      googleSignup(email, id, given_name, family_name)
        .then((returnedUser) => {
          console.log("Returned user:", returnedUser); // Log the response from googleSignup
          if (returnedUser && returnedUser.success) {
            if (
              returnedUser.result.first_name &&
              returnedUser.result.user_name &&
              returnedUser.result.profile &&
              returnedUser.result.mobile_number
            ) {
              router.replace("/myeventsrevisited");
            } else if (
              !returnedUser.result.first_name ||
              !returnedUser.result.profile
            ) {
              router.replace("/onboarding/firstlastname");
            } else if (!returnedUser.result.user_name) {
              router.replace("/onboarding/createusername");
            } else if (!returnedUser.result.mobile_number) {
              router.replace("/otp_add_mobile");
            }
          }
        })
        .catch((error) => {
          console.error("Error in googleSignup:", error);
        });
    }
  }, [userInfo]);

  return { onGoogleButtonPress };
};

