import React from "react";
import axios from "../axios/axiosConfig";
import { updateUserInStorage } from "../async_storage/updateUserInStorage";
import * as Sentry from "@sentry/react-native";

export const updateUser = async (
  e: React.FormEvent<any>,
  categories: string[],
  token: string,
  router: any
): Promise<void> => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "/user/profile-update",
      {
        subcategory_id: categories,
        category_id: ["64cc1b42c695a7581244010c"],
      },
      {
        headers: { "x-access-token": token },
      }
    );
    if (response.data && response.data.success) {
      updateUserInStorage(response.data.result);
      router.push("/onboarding/profilereview");
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

export const updateUserInterests = async (
  e: React.FormEvent<any>, // You might need to replace 'any' with a more specific type for your event object
  interests: string[],
  token: string,
  sharer: boolean | null | undefined,
  router: any
): Promise<void> => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "/user/profile-update",
      {
        interest_id: interests,
      },
      {
        headers: { "x-access-token": token },
      }
    );
    if (response.data && response.data.success) {
      updateUserInStorage(response.data.result);
      router.push(
        sharer ? "/onboarding/setupprofile" : "/onboarding/profilereview"
      );
      console.log("user updated", response.data.result.interest_id);
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.error("Error updating: ", error);
    }
  }
};
