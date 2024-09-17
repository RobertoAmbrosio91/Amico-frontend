import React, { useEffect, useState, FC } from "react";
import { View, Text, SafeAreaView, StyleSheet, Platform, TouchableOpacity, FlatList } from "react-native";
import typography from "../config/typography";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import useFetchUserDataAsync from "../hooks/async_storage/useFetchUserDataAsync";
import Notification from "@/components/notifications/notification";
import fetchUserNotifications from "../hooks/notifications/fetchUserNotifications";
import readNotification from "../hooks/notifications/readNotification";
import { NotificationType } from "../types";
import colors from "@/config/colors";




const Notifications: FC = () => {
  const navigation = useNavigation<any>();
  const currentUser = useFetchUserDataAsync();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Fetch user notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser && currentUser.token) {
        try {
          const fetchedNotifications = await fetchUserNotifications(0, 50, currentUser.token);
          setNotifications(fetchedNotifications);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchNotifications();
  }, [currentUser]);

  // Handle read notification
  const handleNotificationRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification._id === id && !notification.is_read ? { ...notification, is_read: true } : notification
    );

    if (currentUser) {
      readNotification(id, currentUser.token);
    }
    setNotifications(updatedNotifications);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
          <Entypo
                name="chevron-left"
                size={26}
                color={colors.__main_text}
              />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <Notification
              item={item}
              handleNotificationRead={handleNotificationRead}
              isLast={item === notifications[notifications.length - 1]}
            />
          )}
          keyExtractor={item => item._id}
          style={styles.notificationsContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? "15%" : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.__secondary_background,
  },
  container: {
    // paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    marginBottom: 20, // Added some margin bottom for spacing
  },
  title: {
    fontFamily: typography.appFont[700],
    fontSize: 20,
    marginLeft: 10, // Added to align title nicely with back icon
  },
  notificationsContainer: {
    flexGrow: 1, // Ensures the list fills the space
  },
});

export default Notifications;
