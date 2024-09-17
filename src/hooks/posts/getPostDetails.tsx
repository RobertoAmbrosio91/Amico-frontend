import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";
const getPostDetails = async (postId: string, token: string) => {
  try {
    const response = await axios.get(
      `/user/post/${postId}`,

      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      // console.log("post details fetched successfully");
      const result = response.data.result;
      return result;
    } else if (
      response.data &&
      response.data.success == false &&
      response.data.message === "Post id is not valid"
    ) {
      console.log("Post not found");
      const result = response.data.result;
      return result;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.message === "Post id is not valid") {
        console.log("Post not found");
      }
    } else {
      console.error("Something went wrong while fetching post details", error);
    }
    Sentry.captureException(error);
  }
};

export default getPostDetails;

