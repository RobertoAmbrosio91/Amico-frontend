import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
  Share,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import {
  router,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { EventType, Memorytype } from "@/types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import typography from "src/config/typography";
import colors from "src/config/colors";
import * as Haptics from "expo-haptics";

import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";
import { Image } from "expo-image";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import addParticipant from "@/hooks/events/addParticipant";

const SharedEvent = () => {
  const { id } = useLocalSearchParams();
  const currentUser = useFetchUserDataAsync();
  const currentRoute = usePathname();
  const eventId = Array.isArray(id) ? id[0] : id;
  const [eventData, setEventData] = useState<EventType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser && eventId) {
      try {
        setLoading(true);
        const fetchEventData = async () => {
          const fetchedEventDAta = await fetchSingleEvent(
            eventId,
            currentUser.token
          );
          if (fetchedEventDAta) {
            setEventData(fetchedEventDAta);
          }
        };
        fetchEventData();
      } catch (error: any) {
        console.log("Something went wrong fetching the event");
        setError(true);
      } finally {
        setLoading(false);
        setError(false);
      }
    }
  }, [currentUser, eventId]);
  // Create a new Date object
  const date = eventData && new Date(eventData.start_date);
  // Get the day as '20'
  const day = date?.toLocaleDateString("en-US", { day: "numeric" });
  // Get the month as 'May'
  const month = date?.toLocaleDateString("en-US", { month: "short" });
  const joinAndShare = async () => {
    if (currentUser && eventId) {
      const token = currentUser.token;
      try {
        const response = await addParticipant(token, eventId);
        if (response) {
          router.replace({
            pathname: `/event/${eventId}`,
            params: { prevRoute: currentRoute },
          });
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };
  if (eventData)
    return (
      <SafeAreaView style={styles.wrapper}>
        <TouchableOpacity
          style={styles.goBackIcon}
          onPress={() => router.replace("/myeventsrevisited")}
        >
          <Entypo
            name="chevron-left"
            size={35}
            color={colors.__main_background}
          />
        </TouchableOpacity>
        <View style={[styles.headerWrapper]}>
          <View style={styles.headerContainer}>
            <View style={styles.eventNameContainer}>
              <Image
                source={{ uri: eventData.event_image }}
                style={styles.eventImage}
              />
              <View>
                <Text style={styles.eventName}>
                  You're invited to join {eventData.name}!
                </Text>
              </View>
            </View>
          </View>

          <Participants
            participants={eventData.participants}
            router={router}
            id={eventData._id}
          />
          <View style={styles.detailsContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.month}>{month}</Text>
            </View>
            <View style={styles.detaileInnerContainer}>
              <Ionicons name="location-outline" size={24} color="black" />
              <Text>{eventData.location}</Text>
            </View>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.subTitle}>
              Tap 'Join & Share' to join us and help capture the memories. Can’t
              wait to see the moments you’ll create!
            </Text>
            <TouchableOpacity style={styles.button} onPress={joinAndShare}>
              <Text style={styles.textButton}>Join & Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
};

const Participants = ({
  participants,
  router,
  id,
}: {
  participants: any;
  router: any;
  id: string;
}) => (
  <View style={styles.eventParticipantsContainer}>
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
  </View>
);

export default SharedEvent;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingTop: "20%",
  },
  eventNameContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignSelf: "center",
  },
  eventName: {
    color: colors.__main_background,
    fontFamily: typography.appFont[600],
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
    color: colors.__main_background,
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
    borderColor: colors.__amico_blue,
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
    top: "45%",
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.__amico_blue,
    alignSelf: "center",
    marginBottom: 10,
  },
  goBackIcon: {
    position: "absolute",
    left: "3%",
    top: "10%",
    zIndex: 100,
  },
  detailsContainer: {
    flexDirection: "row",
    columnGap: 5,
  },
  detaileInnerContainer: {
    flexDirection: "row",
    columnGap: 5,
    alignItems: "center",
  },
  dateContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: "center",
    width: 45,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
  },
  day: {
    fontSize: 16,
    fontWeight: "bold",
  },
  month: {
    fontSize: 13,
  },
  messageContainer: {
    marginTop: "25%",
    paddingHorizontal: 15,
    rowGap: 15,
  },
  title: {
    fontFamily: typography.appFont[500],
    textAlign: "center",
    fontSize: 16,
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.__amico_blue,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 10,
  },
  textButton: {
    color: colors.w_contrast,
    fontFamily: typography.appFont[600],
  },
});
