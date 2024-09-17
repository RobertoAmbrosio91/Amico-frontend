import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const fetchAllPublicEvents = async (
  token: string
): Promise<any | undefined> => {
  try {
    const result = await axios.get("/event/get-public-events", {
      headers: {
        "x-access-token": token,
      },
    });
    if (result.data && result.data.success) {
      return result.data.result;
    }
  } catch (error: any) {
    console.error(
      "Error fetching the events:",
      error.response?.data?.message || error.message
    );
    Sentry.captureException(error);
    throw error;
  }
};

export default fetchAllPublicEvents;
