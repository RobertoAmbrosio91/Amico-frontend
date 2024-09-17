import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const deleteMemory = async (
  memoryIds: string[],
  token: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      "/event/delete-memories",
      {
        memories_ids: memoryIds,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      return response.data.success;
    } else {
      return response.data.success;
    }
  } catch (error: any) {
    console.log("Error deleting the memory", error);
    Sentry.captureException(error);
    return false;
  }
};

export default deleteMemory;
