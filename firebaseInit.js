import { firebase } from "@react-native-firebase/app";
import Constants from "expo-constants";
import { Platform } from "react-native";
import "@react-native-firebase/analytics";

let firebaseConfig = Constants.expoConfig.extra.firebase.common;

if (Platform.OS === "android") {
  firebaseConfig = {
    ...firebaseConfig,
    ...Constants.expoConfig.extra.firebase.android,
  };
} else if (Platform.OS === "ios") {
  firebaseConfig = {
    ...firebaseConfig,
    ...Constants.expoConfig.extra.firebase.ios,
  };
}

try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  firebase.analytics();
  // firebase.analytics().logEvent("app_open", { time: Date.now() });
} catch (e) {
  console.error("Firebase initialization error", e);
}

export default firebase;
