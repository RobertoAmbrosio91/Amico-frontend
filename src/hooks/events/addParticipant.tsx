import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const addParticipant = async (token: string, eventId: string) => {
  try {
    const response = await axios.post(
      "/event/add-participant",
      {
        eventId: eventId,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      return response.data.success;
    }
  } catch (error: any) {
    console.error("Someting went wrong adding participant", error);
    Sentry.captureException(error);
    throw error;
  }
};

export default addParticipant;
