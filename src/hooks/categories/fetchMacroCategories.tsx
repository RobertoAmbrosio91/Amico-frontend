import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const fetchMacroCategories = async (token: string): Promise<any> => {
  try {
    const response = await axios.get("/master/categorieslist", {
      headers: {
        "x-access-token": token,
      },
    });

    if (response.data && response.data.success) {
      const result = response.data.result;
      return result;
    }
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
};
export default fetchMacroCategories;