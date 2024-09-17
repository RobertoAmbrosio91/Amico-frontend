import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const blockUser = async (
  user_id: string, // Assuming user_id is a string, change the type if necessary
  token: string
): Promise<boolean | undefined> => {
  try {
    const response = await axios.post(
      "/user/block",
      { block_to: user_id },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    if (response.data && response.data.success) {
      // console.log(response.data.message);
      return response.data.success;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log("Something went wrong while blocking the user", error);
    }
    Sentry.captureException(error);
  }
};

export default blockUser;

