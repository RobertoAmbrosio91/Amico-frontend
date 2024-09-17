import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const reportPost = async (
  // post_id: string | null,
  // message: string,
  token: string,
  params: object
): Promise<any> => {
  try {
    const response = await axios.post(
      "/user/post-report",
      // {
      //   post_id: post_id,
      //   report_message: message,
      // }
      params,
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    if (response.data && response.data.success) {
      console.log("Post reported successfully:", response.data);
      return response.data;
    } else {
      console.log("Post report response missing success flag:", response.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios error response:", error.response.data);
      } else if (error.request) {
        console.error("Axios error request:", error.request);
      } else {
        console.error("Axios error message:", error.message);
      }
    } else {
      console.error("Non-Axios error:", error);
    }
    Sentry.captureException(error);
  }
};

export default reportPost;

