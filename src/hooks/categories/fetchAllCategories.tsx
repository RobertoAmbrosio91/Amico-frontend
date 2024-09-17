import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const fetchAllCategories = async (token: string): Promise<any> => {
  // Replace 'any' with 'FetchAllCategoriesResponse' if you have a specific type
  try {
    const response = await axios.post(
      "/master/subcategories",
      {
        category_id: "64cc1b42c695a7581244010c",
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    if (response.data && response.data.success) {
      const result = response.data.result;
      return result;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureEvent(error);
  }
};

export default fetchAllCategories;

