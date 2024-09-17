import axios from "../axios/axiosConfig";
import { updateUserInStorage } from "../async_storage/updateUserInStorage";
import * as Sentry from "@sentry/react-native";

const updateUser = async (token: string, parameters: object) => {
  try {
    const response = await axios.post("/user/profile-update", parameters, {
      headers: { "x-access-token": token },
    });
    if (response.data && response.data.success) {
      updateUserInStorage(response.data.result);
      return response.data;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.error("Error updating: ", error);
    }
    Sentry.captureException(error);
  }
};

export default updateUser;
