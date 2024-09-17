import storeUserData from "../async_storage/storeUser";
import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

export const otpLogin = async (phone_number: string) => {
  try {
    const response = await axios.post("/user/otp-login", {
      mobile_number: phone_number,
    });
    if (response.data && response.data.success) {
      storeUserData(response.data.result);
      return response.data;
    }
  } catch (error: any) {
    console.error("Something went wrong logging in", error);
    Sentry.captureException(error);
  }
};

export const otpSignup = async (phone_number: string) => {
  try {
    const response = await axios.post("/user/otp-signup", {
      mobile_number: phone_number,
    });
    if (response.data && response.data.success) {
      storeUserData(response.data.result);
      return response.data;
    }
  } catch (error: any) {
    console.error("Somethin went wrong signing up", error);
    Sentry.captureException(error);
  }
};

export const otpSignupLogin = async (phone_number: string) => {
  try {
    const response = await axios.post("/user/otp-login-signup", {
      mobile_number: phone_number,
    });
    if (response.data && response.data.success) {
      storeUserData(response.data.result);
      return response.data;
    }
  } catch (error: any) {
    console.error("Something went wrong signing up", error);
    Sentry.captureException(error);
  }
};
