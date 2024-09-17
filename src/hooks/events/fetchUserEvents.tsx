import axios from "../axios/axiosConfig"
import {EventType  } from "../../types"
import * as Sentry from "@sentry/react-native";

const fetchUserEvents = async (
  token: string
): Promise<EventType[] | undefined> => {
  try {
    const response = await axios.get("/event/get-user-events", {
      headers: {
        "x-access-token": token,
      },
    });
    if (response.data && response.data.success) {
      return response.data.result;
    }
  } catch (error: any) {
    console.log("Error fetching the events", error);
    Sentry.captureException(error);
    throw error;
  }
};

export default fetchUserEvents