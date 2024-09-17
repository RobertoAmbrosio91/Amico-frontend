import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";
const createMemory = async (
  event_id: string,
  memory_file: string,
  memory_type: string,
  caption: string,
  token: string,
  prompt_name: string | undefined
) => {
  try {
    const response = await axios.post(
      "/event/create-memory",
      {
        event_id: event_id,
        memory_file: memory_file,
        caption: caption,
        type: memory_type,
        prompt_name: prompt_name,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      console.log("Memory created successfully");
      return response.data;
    }
  } catch (error: any) {
    console.log("Error creating the memory", error.response.data);
    Sentry.captureException(error);
    return error;
  }
};

export default createMemory;
