import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as Sentry from "@sentry/react-native";

const storeFCMToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("FCM", token);
    console.log("Token stored successfully");
  } catch (error) {
    console.log("Error storing token", error);
    Sentry.captureException(error);
  }
};

const requestUserPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      return true;
    } else {
      console.log("Failed token status", authStatus);

      return false;
    }
  } catch (error: any) {
    if (error && error.AuthorizationStatus !== undefined) {
      console.log("Permission request failed:", error);
    } else {
      console.log("Permission request failed: Unknown error");
    }
    Sentry.captureException(error);
    return false;
  }
};

const incrementBadgeCount = async () => {
  const currentCount = await Notifications.getBadgeCountAsync();
  await Notifications.setBadgeCountAsync(currentCount + 1);
};

let isTokenUpdating: boolean = false;

export const useFCMHandler = (): void => {
  const router = useRouter();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // to set the navigation on app start
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage.data && remoteMessage.data.url) {
        // Extract URL from the data payload
        const url = remoteMessage.data.url.toString();
        const memoryId = remoteMessage.data.memory_id;
        if (url && memoryId) {
          router.push({
            pathname: url,
            params: { memory_id: memoryId },
          });
        } else if (url) {
          router.push(url);
        } else {
          router.push("/notifications");
        }
      }
    });

    //handle navigation when the app is open from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        // Check if remoteMessage is not null
        if (remoteMessage && remoteMessage.data && remoteMessage.data.url) {
          // Extract URL from the data payload
          const url = remoteMessage.data.url.toString();
          const memoryId = remoteMessage.data.memory_id;
          if (url && memoryId) {
            router.push({
              pathname: url,
              params: { memory_id: memoryId },
            });
          } else if (url) {
            router.push(url);
          } else {
            router.push("/notifications");
          }
        }
      });

    const initAsync = async () => {
      const permission = await requestUserPermission();

      if (!permission) return;
      else {
        if (!isTokenUpdating) {
          isTokenUpdating = true;
          try {
            // const settoken=messaging().setAPNSToken("1045395831825")
            //   const oldToken = await messaging().getToken();
            //   await messaging().deleteToken();
            //   const newToken = await messaging().getToken();
            // console.log(newToken)
            //   if (oldToken === newToken) {
            //     console.log("not refresh");
            //   } else {
            //     console.log(`FCM Token:`, newToken);
            //     return newToken;
            //   }
            // await storeFCMToken(newToken);
            const token = await messaging().getToken();
            console.log(`FCM Token:`, token);
            await storeFCMToken(token);
          } catch (error) {
            console.log("Error fetching token:", error);
            Sentry.captureException(error);
          } finally {
            isTokenUpdating = false;
          }
        }
      }

      try {
        const remoteMessage = await messaging().getInitialNotification();
        if (remoteMessage) {
          console.log(
            "Notification opened from quit state:",
            remoteMessage.notification
          );
          router.push("/notifications");
        }
      } catch (error) {
        console.error("Error with getInitialNotification:", error);
        Sentry.captureException(error);
      }
    };

    initAsync();

    const tokenRefreshListener = messaging().onTokenRefresh(async (token) => {
      console.log("Token refreshed", token);
      await storeFCMToken(token);
    });

    messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;

        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: title ?? "",
            body: body ?? "",
          },
          trigger: null,
        });
      } else {
        // Handle the case where notification is undefined
        console.log("Notification data is undefined");
      }
    });

    return () => {
      tokenRefreshListener();
    };
  }, []);
};