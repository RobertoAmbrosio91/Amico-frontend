import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
  Share,
  Platform,
} from "react-native";
import React, { memo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EventType, Memorytype } from "@/types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import typography from "src/config/typography";
import colors from "src/config/colors";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import PromptList from "./prompts/PromptList";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";

interface EventHeaderProps {
  eventData: EventType;
  activeSection: string;
  setActiveSection: (section: string) => void;
  navigate: any;
  prevRoute: any;
  handlePresentPromptModal: any;
  setSelectedPrompt: any;
}

const EventHeader: React.FC<EventHeaderProps> = ({
  eventData,
  activeSection,
  setActiveSection,
  navigate,
  prevRoute,
}) => {
  const router = useRouter();
  const { id, memory_id } = useLocalSearchParams();
  const currentUser = useFetchUserDataAsync();
  const isEventLive = (event: EventType) => {
    const currentDate = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return currentDate >= startDate && currentDate <= endDate;
  };
  const onShare = async () => {
    try {
      const url = `https://noosk.co/amicoevent/${eventData._id}`;
      const result = await Share.share({
        message: `${currentUser?.user_name} invited you to join ${eventData.name} on Amico. Join the event now! ${Platform.OS === "android" && url}`,
        url: url,
        title: "Amico",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("shared with activity type of :", result.activityType);
        } else {
          console.log("shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("dismissed");
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <View style={[styles.headerWrapper]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigate()} style={{ width: "15%" }}>
          <Entypo name="chevron-left" size={26} color={"#fff"} />
        </TouchableOpacity>
        <View style={styles.eventNameContainer}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

              router.push({
                pathname: `/event/eventdetails`,
                params: { event_id: eventData._id, prevRoute: prevRoute },
              });
            }}
          >
            <Text style={styles.eventName}>
              {eventData.name.length > 45
                ? eventData.name.slice(0, 45) + "..."
                : eventData.name}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.liveButtonContainer}>
          {isEventLive(eventData) && (
            <View style={styles.liveButtonContainerInner}>
              <View style={styles.liveButtonContainerDot}></View>
              <Text style={styles.liveButtonContainerText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <Participants
        participants={eventData.participants}
        router={router}
        id={eventData._id}
        prevRoute={prevRoute}
      />
      <TouchableOpacity
        onPress={onShare}
        style={[
          styles.shareIcon,
          eventData.name.length > 45 && {
            top: Platform.OS === "android" ? "68%" : "40%",
          },
        ]}
      >
        <Ionicons name="share-outline" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.sectionOptions}>
        <TouchableOpacity
          onPress={() => setActiveSection("memories")}
          style={styles.textContainer}
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={
              activeSection === "memories"
                ? "white"
                : "rgba(255, 255, 255, 0.50)"
            }
          />
          <Text
            style={{
              color:
                activeSection === "memories"
                  ? "white"
                  : "rgba(255, 255, 255, 0.50)",
            }}
          >
            Memories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSection("chat")}
          style={styles.textContainer}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={
              activeSection === "chat" ? "white" : "rgba(255, 255, 255, 0.50)"
            }
          />
          <Text
            style={
              activeSection === "chat"
                ? { color: "#fff" }
                : { color: "rgba(255, 255, 255, 0.50)" }
            }
          >
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSection("album")}
          style={styles.textContainer}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={
              activeSection === "album" ? "white" : "rgba(255, 255, 255, 0.50)"
            }
          />
          <Text
            style={
              activeSection === "album"
                ? { color: "#fff" }
                : { color: "rgba(255, 255, 255, 0.50)" }
            }
          >
            Album
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Participants = ({
  participants,
  router,
  id,
  prevRoute,
}: {
  participants: any;
  router: any;
  id: string;
  prevRoute: string;
}) => (
  <Pressable
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      router.push({
        pathname: `/event/eventdetails`,
        params: { event_id: id, prevRoute: prevRoute },
      });
    }}
    style={styles.eventParticipantsContainer}
  >
    <Text style={styles.eventParticipantsContainerText}>
      {participants.length}{" "}
      {participants.length === 1 ? "Participant" : "Participants"}
    </Text>

    {participants.slice(0, 4).map((participant: any, index: number) => (
      <Image
        key={participant._id}
        source={{ uri: participant.profile }}
        style={[styles.friendImage, index !== 0 && { left: index * -10 }]}
      />
    ))}
    {participants.length > 4 && (
      <View style={styles.participantImageOthers}>
        <Text style={[styles.participantImageOthersText]}>
          +{participants.length - 4}
        </Text>
      </View>
    )}
  </Pressable>
);

export default memo(EventHeader);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    // columnGap: 10,
    justifyContent: "space-between",
    width: "100%",
  },
  headerWrapper: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    columnGap: 10,
    padding: 14,
    paddingTop: Platform.OS === "android" ? "10%" : 0,
  },
  eventNameContainer: {
    flexGrow: 1, // Allow the container to grow
    justifyContent: "center",
    alignSelf: "center",
  },
  eventName: {
    color: colors.__main_text_color,
    fontFamily: typography.appFont[700],
    fontSize: 16,
    maxWidth: 240,
    alignSelf: "center",
    textAlign: "center",
  },
  liveButtonContainer: {
    flexDirection: "row",
    width: "15%",
  },
  liveButtonContainerInner: {
    flexDirection: "row",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#FF3E3E",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 6,
  },
  liveButtonContainerDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FF3E3E",
  },
  liveButtonContainerText: {
    fontFamily: typography.appFont[700],
    fontSize: 10,
    color: "#fff",
  },

  sectionOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    padding: 3,
    height: 40,
    // columnGap: 20,
    width: 250,
    alignSelf: "center",
    borderRadius: 30,
  },
  textContainer: {
    flexDirection: "row",
    columnGap: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  eventParticipantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    left: "10%",
  },
  participantsContentContainer: {
    justifyContent: "center",
  },
  eventParticipantsContainerText: {
    fontSize: 13,
    fontFamily: typography.appFont[400],
    color: "rgba(255, 255, 255, 0.80);",
    marginRight: 5,
  },
  eventParticipantsContainerIn: {
    flexDirection: "column",
    marginRight: -15,
    alignItems: "center",
    rowGap: 3,
    alignSelf: "center",
  },
  friendImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.__main_background,
  },
  participantImageOthers: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    left: -40,
  },
  participantImageOthersText: {
    fontSize: 16,
    fontFamily: typography.appFont[700],
  },
  shareIcon: {
    position: "absolute",
    right: "5%",
    top: Platform.OS === "android" ? "65%" : "35%",
  },
});