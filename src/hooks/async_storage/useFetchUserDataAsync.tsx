import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CurrentUserType } from "../../types";

const useFetchUserDataAsync = () => {
  // Explicitly define the type for currentUser as CurrentUserType or null
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null | undefined>(undefined);


  useEffect(() => {
    const fetchUserData = async () => {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user as CurrentUserType); 
      } else {
        console.log("No user data found");
        setCurrentUser(null);
      }
    };

    fetchUserData();
  }, []);

  return currentUser;
};

export default useFetchUserDataAsync;
