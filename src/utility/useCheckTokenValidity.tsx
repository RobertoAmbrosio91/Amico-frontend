import { View, Text } from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import fetchFCMfromAsync from "@/hooks/async_storage/fetchFCMfromAsync";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import saveToken from "@/hooks/fcm_token/saveFCM";
import refreshToken from "@/hooks/users/refreshToken";
import * as Sentry from "@sentry/react-native";

const useCheckTokenValidity = () => {
  const currentUser = useFetchUserDataAsync();
  const tokenFCM = fetchFCMfromAsync();

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/landing");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
      Sentry.captureException(error);
    }
  };
  //saving token im database
  useEffect(() => {
    if (tokenFCM && currentUser) {
      saveToken(tokenFCM, currentUser.token);
    }
    if (currentUser) {
      refreshToken(currentUser.token)
        .then(() => {
          console.log("Token refreshed successfully.");
        })
        .catch((error) => {
          clearAllData();
        });
    }
  }, [tokenFCM, currentUser]);
};

export default useCheckTokenValidity;
