import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Assuming the function returns an array of a certain type, for example, Post[]
// Replace 'any[]' with the actual type of your post objects, if available
const fetchAndFilterPost = async (
  current_page: number,
  noDocs: number,
  categoriesId: string[],
  textInput: string,
  token: string
): Promise<any[]> => {
  // Replace 'any[]' with the actual return type
  try {
    const response = await axios.post(
      "/user/search-posts",
      {
        current_page,
        no_of_docs_each_page: noDocs,
        subcategory_id: categoriesId,
        search: textInput,
      },
      {
        headers: { "x-access-token": token },
      }
    );
    if (response && response.data && response.data.success) {
      const result = response.data.result.posts;
      return result;
    }
  } catch (error: any) {
    // Consider using a more specific error type if available
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
  return []; // Return an empty array in case of failure
};

export default fetchAndFilterPost;


