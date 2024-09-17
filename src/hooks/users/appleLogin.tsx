import * as AppleAuthentication from "expo-apple-authentication";
import axios from "../axios/axiosConfig";
import storeUserData from "../async_storage/storeUser";
import * as Sentry from "@sentry/react-native";

const appleLogin = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential) {
      // Check if fullName is not null
      if (credential.fullName) {
        try {
          const response = await axios.post("/user/social-login", {
            email: credential.email,
            social_id: credential.user,
            first_name: credential.fullName.givenName,
            last_name: credential.fullName.familyName,
            sign_up_type: "apple",
          });

          if (response.data && response.data.success) {
            // console.log("User registered successfully with apple");

            storeUserData(response.data.result);
            return response.data;
          }
        } catch (error: any) {
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            console.log(error.response.data.message);
          } else {
            console.log("Something went wrong with apple login", error);
          }
          Sentry.captureException(error);
        }
      } else {
        console.log("Full name is null");
      }
    } else {
      console.log("No email");
    }
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      console.log("Login canceled");
    } else {
      console.log("Apple login failed, something went wrong", e);
    }
    Sentry.captureException(e);
  }
};

export default appleLogin;

