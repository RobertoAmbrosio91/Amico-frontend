import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Assuming postId is a string. Change to 'number' if IDs are numeric
const deletePost = async (
  postId: string, 
  token: string
): Promise<boolean | undefined> => {  // Function returns a boolean or undefined
  try {
    const response = await axios.delete(
      `/user/post/${postId}`,
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response && response.data && response.data.success) {
      // console.log("Post deleted successfully");
      return response.data.success;
    }
  } catch (error: any) {  // Consider using a more specific error type if available
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
};

export default deletePost;
