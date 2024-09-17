import { uploadImageTos3 } from "../../functionality/uploadImageTos3";
import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

// Define the structure of the API response, if necessary
interface UpdateProfileImageResponse {
  success: boolean;
  // Include any other fields that might be part of the response
}

const updateProfileImage = async (
  imageUrl: string,
  token: string
): Promise<void> => {
  try {
    const cloudFrontURL = await uploadImageTos3(imageUrl);
    if (cloudFrontURL) {
      const response = await axios.post<UpdateProfileImageResponse>(
        "/user/profile-update",
        {
          profile: cloudFrontURL,
        },
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (response.data && response.data.success) {
        console.log("Image updated successfully");
      }
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
    Sentry.captureException(error);
  }
};

export default updateProfileImage;

