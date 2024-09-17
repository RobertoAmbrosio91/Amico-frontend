import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const sendVerification = async (
  email: string,
  _id: string,
  instagram: string,
  linkedin: any,
  twitter: any
) => {
  try {
    const response = await axios.post("/user/send-verification", {
      email: email,
      _id: _id,
      instagram: instagram,
      linkedin: linkedin,
      twitter: twitter,
    });
    if (response.data && response.data.success) {
      console.log("Verification sent successfully");
      return response.data.success;
    }
  } catch (error) {
    console.log("Something went wrong", error);
    Sentry.captureException(error);
  }
};

export default sendVerification;

