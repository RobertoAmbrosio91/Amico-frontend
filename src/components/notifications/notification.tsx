  import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
  import React from "react";
  import typography from "../../config/typography";
  import colors from "../../config/colors";
  import getTimeAgo from "../../functionality/timeAgo";
  import { NotificationType } from "../../types";
  import { router, usePathname, useRouter } from "expo-router";
  import { Image } from "expo-image";

  interface NotificationProps {
    item: NotificationType;
    handleNotificationRead: (id: string) => void;
    isLast: boolean;
  }

  export type RootStackParamList = {
    PostFull: {
      postId: string | undefined;
    };
  };

  const Notification: React.FC<NotificationProps> = ({
    item,
    handleNotificationRead,
    isLast,
  }) => {
    const router = useRouter();
    const currentRoute = usePathname();

    const nooskImg =
      "https://dijtywqe2wqrv.cloudfront.net/public/noosk_icon_512.png";

    const navigate = (item: NotificationType) => {
      if (item.data_message.type === "Post_Reaction") {
        router.push({
          pathname: `/myeventsrevisited`,
          params: { post_id: item.data_message.post_id },
        });
      } else if (item.data_message.type === "Event Terminated") {
        router.push({
          pathname: `/event/${item.data_message.event_id}`,
          params: { prevRoute: currentRoute },
        });
      } else if (item.data_message.type === "Memory_Reaction") {
        router.push({
          pathname: `/memory/${item.data_message.event_id}`,
          params: { memory_id: item.data_message.memory_id },
        });
      } else if (
        item.data_message.type === "Post Create" ||
        item.data_message.type === "Post Upvote"
      ) {
        router.push(`postfull/${item.data_message.post_id}`);
      } else if (item.data_message.type === "Chat Message") {
        router.push(`chat/${item.data_message.chat_id}`);
      } else if (item.data_message.type === "Event Terminated") {
        router.push(`/album/${item.data_message.event_id}`);
      } else if (item.data_message.type === "Friend_Request") {
        router.push({
          pathname: `/myfriends`,
          params: { section: "requests" },
        });
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.notificationContainer,
          !item.is_read ? { backgroundColor: "rgba(51, 159, 194, 0.1)" } : {},
          isLast ? { marginBottom: 60 } : {},
        ]}
        onPress={() => {
          handleNotificationRead(item._id);
          navigate(item);
        }}
      >
        <View style={styles.notification}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationBody}>{item.message}</Text>
            <Text style={styles.notificationTimeAgo}>{getTimeAgo(item)}</Text>
          </View>

          <View style={styles.profileImage}>
            <Image
              style={styles.image}
              source={{
                uri: item.sender.length > 0 ? item.sender[0].profile : nooskImg,
              }}
              contentFit="cover"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    notification: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 4,
    },
    notificationBody: {
      flex: 1,
      paddingRight: 5,
      color: colors.__blue_dark,
    },
    notificationContainer: {
      rowGap: 5,
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    notificationTimeAgo: {
      fontFamily: typography.appFont[400],
      fontSize: 12,
      color: colors.__blue_medium,
    },
    image: {
      width: "100%",
      height: "100%",
      // resizeMode: "cover",
      position: "absolute",
      borderRadius: 4,
    },
  });

  export default Notification;
