import React, { ReactNode, useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import colors from "../../config/colors";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import typography from "../../config/typography";
import { UserData, EventType } from "../../types";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import * as Haptics from "expo-haptics";
import getFileType from "@/services/getFileType";
interface EventComponentProps {
  myEvents?: EventType[];
  userData?: UserData;
  events: EventType;
  setIsCameraOpen?: (isOpen: boolean) => void;
  navigateAndOpenCamera?: () => void;
  refreshing?: any;
  onRefresh?: any;
  // navigationPath: (eventId: string) => string;
}

const MediaDisplay = ({ uri, style }: any) => {
  const isVideo = uri.match(/\.(mp4|avi|mov)$/i);
  return isVideo ? (
    <Video
      source={{ uri }}
      style={style}
      shouldPlay={false}
      resizeMode={ResizeMode.COVER}
    />
  ) : (
    <Image source={{ uri }} style={style} />
  );
};

const EventComponent: React.FC<EventComponentProps> = ({
  events,
  // navigationPath,
}) => {
  const router = useRouter();
  const currentRoute = usePathname();
  const mediaItems = events.memories || [];
  const commaIndex = events.location.indexOf(",");
  const slicedLocation = events.location.slice(commaIndex + 1);
  const standardImage =
    events.event_image ===
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";
  const mediaCover = () => {
    const imageMemories = events.memories.filter(
      (memory) => getFileType(memory.media_file) === "image"
    );

    if (imageMemories.length !== 0) return imageMemories[0].media_file;
    else {
      return events.event_image;
    }
  };

  if (events && mediaItems) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          router.push({
            pathname: `/event/${events._id}`,
            params: { prevRoute: currentRoute },
          });
        }}
        style={[
          styles.eventContainer,
          { width: Dimensions.get("window").width - 30 },
        ]}
      >
        <View style={styles.eventContainerTop}>
          {mediaItems.length === 0 || !standardImage ? (
            <MediaDisplay
              uri={events.event_image}
              style={styles.imageContainerTop}
            />
          ) : (
            <Image
              source={{ uri: mediaCover() }}
              style={styles.imageContainerTop}
            />
          )}
          {mediaItems.length > 0 && (
            <View style={styles.containerRight}>
              {mediaItems.slice(1, 3).map((item, index) => (
                <MediaDisplay
                  key={index}
                  uri={item.media_file}
                  style={styles.imageContainerLeftTop}
                />
              ))}
            </View>
          )}
        </View>
        <View style={styles.eventContainerBottom}>
          <View style={styles.eventContainerBottomOuter}>
            <Text
              style={styles.eventName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {events.name}
            </Text>
            <Text
              style={styles.eventLocation}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {slicedLocation}
            </Text>
          </View>
          <View style={styles.eventContainerBottomInner}>
            {events.participants.slice(0, 3).map((participant) => (
              <Image
                key={participant._id}
                source={{ uri: participant.profile }}
                style={styles.participantImage}
              />
            ))}
            {events.participants.length > 3 && (
              <View style={styles.participantImageOthers}>
                <Text style={styles.participantImageOthersText}>
                  +{events.participants.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  eventContainer: {
    height: 247,
    flexDirection: "column",
    // width: 362,
    marginVertical: 10,
    borderRadius: 15, // Increased for a softer edge
    backgroundColor: "#FFFBF2", // Assuming cards are white
    padding: 10,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E9E2D1",
  },
  eventContainerTop: {
    flexDirection: "row",
    height: "80%",
    gap: 10,
  },
  eventContainerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "17%",
  },
  eventContainerBottomOuter: {
    flexDirection: "column",
    gap: 7,
    width: "58%",
    height: "100%",
  },
  eventContainerBottomInner: {
    flexDirection: "row",
    paddingRight: 15,
  },
  eventContainerBottomInnerImage: {
    flexDirection: "row",
  },
  eventContainerBottomImage: {
    flexDirection: "row",
  },
  eventDetails: {
    flex: 1,
    justifyContent: "flex-start", // Align text to the top of the container
    alignItems: "center", // Center align text
    paddingTop: 15,
  },
  containerRight: {
    width: "38%",
    justifyContent: "space-between",
  },
  imageContainerTop: {
    width: "58%",
    height: "100%", // Reduced to create space for event name below
    borderRadius: 10,
  },
  imageContainerLeftTop: {
    height: "45%",
    borderRadius: 10,
  },
  imageContainerLeftBott: {
    height: "40%",
    borderRadius: 10,
  },
  eventName: {
    fontSize: 16,
    fontFamily: typography.appFont[700],
    color: colors.__main_text,
    width: "100%",
  },
  eventLocation: {
    fontSize: 11,
    fontFamily: typography.appFont[400],
    color: colors.__main_text,
    width: "100%",
  },
  participantImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: -15,
    borderWidth: 2,
    borderColor: "#FFFBF2",
  },
  participantImageOthers: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D9D9D9",
    marginRight: -15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  participantImageOthersText: {
    fontSize: 16,
    fontFamily: typography.appFont[700],
  },
});
    
      export default EventComponent;