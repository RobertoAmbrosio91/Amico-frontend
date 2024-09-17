import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";


const fetchUserPosts = async (
  current_page: number,
  no_of_docs: number,
  user_id: string | number, // Use 'number' if user_id is numeric
  token: string
): Promise<any[]> => { // Replace 'any[]' with the actual return type
  try {
    const response = await axios.post(
      "/user/list-owned-post",
      {
        current_page,
        no_of_docs_each_page: no_of_docs,
        user_id,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      const posts = response.data.result.posts;
      return posts;
    }
  } catch (error: any) { // Consider using a more specific error type if available
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error("Error fetching posts", error);
    }
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure
};

export default fetchUserPosts;

