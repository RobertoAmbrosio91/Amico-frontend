import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";
// Define the type for the event creation response, if necessary.
// This example assumes a simplified type, but you should adjust it according to your actual data structure.
type EventCreationResponse = {
  success: boolean;
  message: string;
  result: {
    created_by: string;
    name: string;
    description: string;
    participants: string[];
    is_expired: boolean;
    start_date: string;
    end_date: string;
    event_image: string;
    event_visibility: string;
    event_type: string;
    _id: string;
    updatedAt: string;
    createdAt: string;
    __v: number;
  };
};

const createEventHandler = async (
  eventData: {
    name: string;
    description?: string;
    participants?: string[];
    event_type: string;
    event_visibility?: string;
    start_date?: string;
    end_date?: string;
    event_image: string | undefined;
    location: string;
  },
  token: string
): Promise<EventCreationResponse | undefined> => {
  try {
    const response = await axios.post("/event/create-event", eventData, {
      headers: {
        "x-access-token": token,
      },
    });

    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (error: any) {
    console.error(
      "Error creating event:",
      error.response?.data?.message || error.message
    );

    Sentry.captureException(error, {});
  }
};

export default createEventHandler;