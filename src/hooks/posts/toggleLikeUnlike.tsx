import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";


export const toggleLikeUnlike = async (
  post_id: string,
  token: string
): Promise<any> => {
  try {
    const response = await axios.post(
      "/user/like-unlike-post",
      {
        post_id,
        type: "Like",
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      return response.data.result;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      if (responseData && responseData.message) {
        console.error(responseData.message);
      } else {
        console.error(error.message);
      }
    } else {
      console.error(error);
    }
   Sentry.captureException(error);
  }
};
