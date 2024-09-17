import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

const checkRequestStatus = async (token: string, ids: string[]) => {
  try {
    const result = await axios.post(
      "/user/request-status",
      {
        ids: ids,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    return result.data.result;
  } catch (error: any) {
    console.log("Something went wrong checking the request", error);
    Sentry.captureException(error);
  }
};

export default checkRequestStatus;
