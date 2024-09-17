import axios from "../axios/axiosConfig"
import * as Sentry from "@sentry/react-native";

const fetchAllEvents = async (token: string): Promise<any | undefined> => {
  try {
    const result = await axios.get("/event/get-all-events", {
      headers: {
        "x-access-token": token,
      },
    });
    if (result.data && result.data.success) {
      return result.data.result;
    }
  } catch (error: any) {
    console.error(
      "Error creating event:",
      error.response?.data?.message || error.message
    );
    Sentry.captureException(error);
  }
};

export default fetchAllEvents