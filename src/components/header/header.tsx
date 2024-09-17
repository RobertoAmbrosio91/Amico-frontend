import React, { useState, useEffect,useRef } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import fetchUserNotifications from "../../hooks/notifications/fetchUserNotifications";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import { NotificationType } from "../../types";
import { useRouter, usePathname } from "expo-router";
import io, { Socket } from "socket.io-client";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";

// Define the types for the component's props
interface HeaderProps {
  style?: object;
  isSearch?: boolean;
  setIsSearch?: (isSearch: boolean) => void;
  section?: string;
}

type RootParamList = {
  HomeNew: undefined; // Add other routes with their expected params
  Notifications: undefined;
  // ... other routes
};

const Header: React.FC<HeaderProps> = ({
  style = {},
  isSearch = false,
  setIsSearch = () => {},
  section,
}) => {
  const router = useRouter();
  const currentRoute = usePathname();
  const isIcons = [
    "/myeventsrevisited",
    "/myfriends",
    "/myevents",
    "/profile",
  ].includes(currentRoute);
  const currentUser = useFetchUserDataAsync();
  const [page, setPage] = useState<number>(0);
  const [notifications, setNotifications] = useState<number>(0);
  const FetchStatus = {
    IDLE: "idle",
    FETCHING: "fetching",
    FETCHED: "fetched",
  };
  const [fetchStatus, setFetchStatus] = useState<string>(FetchStatus.IDLE);
  const socketRef = useRef<Socket>();
  useEffect(() => {
    const fetchNotifications = async () => {
      if (
        currentUser &&
        currentUser.token &&
        fetchStatus === FetchStatus.IDLE
      ) {
        setFetchStatus(FetchStatus.FETCHING);
        try {
          const fetchedNotifications = await fetchUserNotifications(
            page,
            1000,
            currentUser.token
          );
          if (fetchedNotifications) {
            let total = 0;
            const notifications: NotificationType[] = fetchedNotifications;
            notifications.forEach((notification) => {
              if (!notification.is_read) total++;
            });
            setNotifications(total);
            setFetchStatus(FetchStatus.FETCHED);
          }
        } catch (error) {
          console.log(error);
          setFetchStatus(FetchStatus.IDLE);
        }
      }
    };
    fetchNotifications();
  }, [currentUser, fetchStatus, page]);

  useEffect(() => {
    socketRef.current = io("https://socket.noosk.co");
    // socketRef.current = io("https://9d40-108-30-90-124.ngrok-free.app");
    socketRef.current.emit("join_notifications", currentUser?._id);
    socketRef.current.on("notification_read", () => {
      setNotifications((prevNotifications) => prevNotifications - 1);
    });
    socketRef.current.on("new_notification", () => {
      console.log("new notification");
      setNotifications((prevNotifications) => prevNotifications + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    const updateAppBadge = async () => {
      await Notifications.setBadgeCountAsync(notifications);
    };

    updateAppBadge();
  }, [notifications]);
  const navigate = () => {
    if (
      currentRoute === "/myeventsrevisited" ||
      currentRoute === "/myevents" ||
      currentRoute === "/profile" ||
      currentRoute === "/myfriends" ||
      currentRoute.includes("/user/")
    ) {
      router.push("/myeventsrevisited");
    }
  };
  const logo = require("../../../assets/logo-amico-white.png");

  return (
    <View style={styles.headerContainer}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => navigate()}
          style={styles.logoContainer}
        >
          <Image
            source={logo}
            style={{ width: 85, height: 23, alignSelf: "center" }}
          />
        </TouchableOpacity>
        {isIcons && (
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.__01_light_n}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/notifications")}>
              <Feather name="bell" size={24} color={colors.__01_light_n} />
              {notifications > 0 && (
                <View style={styles.notificationsContainer}>
                  <Text style={styles.notificationsNumber}>
                    {notifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginTop: Platform.OS === "android" ? "-9%" : 0,
    paddingHorizontal: 5,
  },
  logoContainer: {
    flex: 1,
    alignSelf: "center",
    height: 25,
  },
  amicoLogo: {
    height: 200,
    width: 200,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Aligns icons to the right
    position: "absolute",
    right: 10, // Ensures some padding from the right edge
    columnGap: 12, // Ensures icons are aligned in the center vertically
  },
  notificationsNumber: {
    textAlign: "center",
    fontSize: 10,
    color: "#fff",
  },
  notificationsContainer: {
    backgroundColor: "red",
    height: 17,
    width: 17,
    borderRadius: 100,
    justifyContent: "center",
    position: "absolute",
    top: "-20%",
    left: "50%",
  },
});

export default Header;

 