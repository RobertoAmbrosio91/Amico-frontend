import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const updateEvent = async (token: string, parameters: object) => {
  try {
    const response = await axios.post("/event/update-event", parameters, {
      headers: {
        "x-access-token": token,
      },
    });
    if (response.data && response.data.success) {
      console.log("Event updated");
      return response.data;
    }
  } catch (error: any) {
    console.log("Error updating the event ", error);
    Sentry.captureException(error);
  }
};

export default updateEvent;
