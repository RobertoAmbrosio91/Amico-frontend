import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const createEventPost = async (params: object, token: string) => {
  try {
    const response = await axios.post("/user/create-post", params, {
      headers: {
        "x-access-token": token,
      },
    });
    if (response.data && response.data.success) {
      console.log("Post created successfully");
      return response.data.success;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.error("Error creating the post ", error);
    }
    Sentry.captureException(error);
  }
};

export default createEventPost;
