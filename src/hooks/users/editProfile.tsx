import axios from "../axios/axiosConfig";
import { updateUserInStorage } from "../async_storage/updateUserInStorage";
import { UserData } from "../../types";
import * as Sentry from "@sentry/react-native";

interface EditProfileResponse {
  success: boolean;
  message: string;
  result: UserData;
}

const editProfile = async (
  first_name: string,
  last_name: string,
  token: string,
  bio?: string
): Promise<UserData | undefined> => {
  try {
    const response = await axios.post<EditProfileResponse>(
      "/user/profile-update",
      {
        first_name,
        last_name,
        bio,
      },
      {
        headers: { "x-access-token": token },
      }
    );

    if (response.data && response.data.success) {
      // console.log("User updated successfully");
      updateUserInStorage(response.data.result);
      return response.data.result;
    }
  } catch (error: any) {
    console.error(error.response?.data?.message || error);
    Sentry.captureException(error);
  }
};

export default editProfile;

