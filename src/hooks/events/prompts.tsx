import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const createPrompt = async (
  token: string,
  event_id: string,
  name: string,
  memory_id: string,
  prompt_image: string
) => {
  try {
    const response = await axios.post(
      "/event/create-prompt",
      {
        event_id: event_id,
        prompt: {
          name: name,
          memories_id: [memory_id],
          prompt_image: prompt_image,
        },
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      console.log("prompt created successfully");
    }
  } catch (error: any) {
    console.log("Error creating the prompt", error);
    Sentry.captureException(error);
    throw error;
  }
};

export default createPrompt;
