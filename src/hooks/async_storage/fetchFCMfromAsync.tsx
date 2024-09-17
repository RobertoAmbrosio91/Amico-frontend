import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchFCMfromAsync = (): string | null => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchFCM = async () => {
      const fcm = await AsyncStorage.getItem("FCM");
      if (fcm !== null) {
        setToken(fcm);
      } else {
        console.log("Token not found");
      }
    };

    fetchFCM();
  }, []);

  return token;
};

export default fetchFCMfromAsync;

